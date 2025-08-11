import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new WinstonCloudWatch({
      logGroupName: 'my-log-group',
      logStreamName: 'my-log-stream',
      awsRegion: process.env.AWS_REGION,
      jsonMessage: true,
    }),
    new winston.transports.Console(),
  ],
});

export default logger;
