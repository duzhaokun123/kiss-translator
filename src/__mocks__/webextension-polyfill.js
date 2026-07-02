module.exports = {
  runtime: {
    connect: jest.fn(),
    sendMessage: jest.fn(),
    onMessage: { addListener: jest.fn(), removeListener: jest.fn() },
    onConnect: { addListener: jest.fn(), removeListener: jest.fn() },
    getURL: jest.fn((path) => path),
    id: "test-extension-id",
  },
  storage: {
    local: { get: jest.fn(), set: jest.fn(), remove: jest.fn() },
    sync: { get: jest.fn(), set: jest.fn(), remove: jest.fn() },
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
  },
};
