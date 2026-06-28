import net from "node:net";
import readline from "node:readline";
import tls from "node:tls";

type SmtpConnection = net.Socket | tls.TLSSocket;

type MailAddress = {
  name?: string;
  email: string;
};

type SendMailInput = {
  host: string;
  port: number;
  secure: boolean;
  user?: string | null;
  password?: string | null;
  from: MailAddress;
  to: MailAddress[];
  cc?: MailAddress[];
  bcc?: MailAddress[];
  replyTo?: string | null;
  subject: string;
  text: string;
  html: string;
};

type SmtpResponse = {
  code: number;
  lines: string[];
};

function encodeHeaderValue(value: string) {
  if (/^[\x20-\x7E]*$/.test(value)) {
    return value;
  }

  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function formatMailAddress(address: MailAddress) {
  return address.name ? `${encodeHeaderValue(address.name)} <${address.email}>` : address.email;
}

function buildRecipients(to: MailAddress[], cc: MailAddress[] = [], bcc: MailAddress[] = []) {
  return [...to, ...cc, ...bcc].map((recipient) => recipient.email);
}

function createReader(socket: SmtpConnection) {
  const rl = readline.createInterface({
    input: socket,
    crlfDelay: Infinity
  });

  let pending: {
    resolve: (response: SmtpResponse) => void;
    reject: (error: Error) => void;
  } | null = null;
  const queuedResponses: SmtpResponse[] = [];
  let currentLines: string[] = [];

  const onLine = (line: string) => {
    const matched = line.match(/^(\d{3})([ -])/);

    if (matched) {
      const [, code, separator] = matched;

      currentLines.push(line);

      if (separator === " ") {
        const response = {
          code: Number(code),
          lines: currentLines
        };

        if (pending) {
          const resolver = pending.resolve;
          pending = null;
          resolver(response);
        } else {
          queuedResponses.push(response);
        }

        currentLines = [];
      }
    } else {
      currentLines.push(line);
    }
  };

  const onError = (error: Error) => {
    if (!pending) {
      return;
    }

    const reject = pending.reject;
    pending = null;
    reject(error);
  };

  rl.on("line", onLine);
  socket.on("error", onError);

  return {
    read(): Promise<SmtpResponse> {
      const queued = queuedResponses.shift();

      if (queued) {
        return Promise.resolve(queued);
      }

      return new Promise((resolve, reject) => {
        pending = {
          resolve,
          reject
        };
      });
    },
    close() {
      rl.close();
      socket.off("error", onError);
    }
  };
}

async function openConnection(host: string, port: number, secure: boolean) {
  if (secure) {
    return tls.connect({
      host,
      port,
      servername: host
    });
  }

  return net.connect({
    host,
    port
  });
}

function createMessage({
  from,
  to,
  cc = [],
  bcc = [],
  replyTo,
  subject,
  text,
  html
}: Omit<SendMailInput, "host" | "port" | "secure" | "user" | "password">) {
  const boundary = `boundary_${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`;
  const headers = [
    `From: ${formatMailAddress(from)}`,
    `To: ${to.map(formatMailAddress).join(", ")}`,
    ...(cc.length > 0 ? [`Cc: ${cc.map(formatMailAddress).join(", ")}`] : []),
    ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
    `Subject: ${encodeHeaderValue(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`
  ];

  const parts = [
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    `--${boundary}`,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    `--${boundary}--`
  ];

  return `${headers.join("\r\n")}\r\n\r\n${parts.join("\r\n")}`;
}

async function sendCommand(reader: ReturnType<typeof createReader>, socket: SmtpConnection, command: string) {
  socket.write(`${command}\r\n`);
  const response = await reader.read();

  if (response.code >= 400) {
    throw new Error(response.lines.join("\n"));
  }

  return response;
}

async function authenticate(
  reader: ReturnType<typeof createReader>,
  socket: SmtpConnection,
  user: string,
  password: string
) {
  const authPlain = Buffer.from(`\0${user}\0${password}`, "utf8").toString("base64");

  try {
    const plainResponse = await sendCommand(reader, socket, `AUTH PLAIN ${authPlain}`);

    if (plainResponse.code === 235) {
      return;
    }
  } catch {
    // Fall back to AUTH LOGIN for servers that do not accept PLAIN.
  }

  const loginResponse = await sendCommand(reader, socket, "AUTH LOGIN");

  if (loginResponse.code !== 334) {
    throw new Error(loginResponse.lines.join("\n"));
  }

  const userResponse = await sendCommand(
    reader,
    socket,
    Buffer.from(user, "utf8").toString("base64")
  );

  if (userResponse.code !== 334) {
    throw new Error(userResponse.lines.join("\n"));
  }

  const passwordResponse = await sendCommand(
    reader,
    socket,
    Buffer.from(password, "utf8").toString("base64")
  );

  if (passwordResponse.code !== 235) {
    throw new Error(passwordResponse.lines.join("\n"));
  }
}

export async function sendSmtpEmail(input: SendMailInput) {
  const socket = await openConnection(input.host, input.port, input.secure);
  socket.setTimeout(15_000);

  const reader = createReader(socket);

  try {
    const greeting = await reader.read();

    if (greeting.code >= 400) {
      throw new Error(greeting.lines.join("\n"));
    }

    await sendCommand(reader, socket, `EHLO ${"placement-crm.local"}`);

    if (input.user && input.password) {
      await authenticate(reader, socket, input.user, input.password);
    }

    await sendCommand(reader, socket, `MAIL FROM:<${input.from.email}>`);

    const recipients = buildRecipients(input.to, input.cc, input.bcc);

    if (recipients.length === 0) {
      throw new Error("At least one recipient is required.");
    }

    for (const recipient of recipients) {
      await sendCommand(reader, socket, `RCPT TO:<${recipient}>`);
    }

    const dataResponse = await sendCommand(reader, socket, "DATA");

    if (dataResponse.code !== 354) {
      throw new Error(dataResponse.lines.join("\n"));
    }

    const message = createMessage({
      from: input.from,
      to: input.to,
      cc: input.cc,
      bcc: input.bcc,
      replyTo: input.replyTo,
      subject: input.subject,
      text: input.text,
      html: input.html
    });

    socket.write(`${message}\r\n.\r\n`);

    const deliveryResponse = await reader.read();

    if (deliveryResponse.code >= 400) {
      throw new Error(deliveryResponse.lines.join("\n"));
    }

    await sendCommand(reader, socket, "QUIT");

    return {
      success: true,
      message: "Email delivered successfully."
    };
  } finally {
    reader.close();
    socket.end();
  }
}
