import redis from "redis";

export default class RedisConnector {
  constructor() {
    this.writerClient = null;
    this.readerClient = null;
    this.connect();
  }

  connect() {
    if (this.writerClient === null) {
      this.writerClient = redis.createClient({
        url: process.env.REDIS_WRITE_CLIENT_USER_SESSION,
      })
        .on('error', (err) => console.warn('Redis Writter Client Error', err))
        .connect();
      console.warn('Redis writter connected');
    }

    if (this.readerClient === null) {
      this.readerClient = redis.createClient({
        url: process.env.REDIS_READ_CLIENT_USER_SESSION,
      })
        .on('error', (err) => console.warn('Redis Readder Client Error', err))
        .connect();
      console.warn('Redis Reader connected');
    }
  }

  getWriterConnection() {
    return this.writerClient;
  }

  async getReaderConnection() {
    return this.readerClient;
  }
}

