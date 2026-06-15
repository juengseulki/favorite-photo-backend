const clients = new Map();

export function addSseClient(userId, res) {
  const key = String(userId);

  if (!clients.has(key)) {
    clients.set(key, new Set());
  }

  clients.get(key).add(res);
}

export function removeSseClient(userId, res) {
  const key = String(userId);
  const userClients = clients.get(key);

  if (!userClients) return;

  userClients.delete(res);

  if (userClients.size === 0) {
    clients.delete(key);
  }
}

export function sendSseToUser(userId, eventName, data) {
  const key = String(userId);
  const userClients = clients.get(key);

  if (!userClients) return;

  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;

  userClients.forEach((client) => {
    client.write(payload);
  });
}

export function getSseClientCount(userId) {
  return clients.get(String(userId))?.size ?? 0;
}
