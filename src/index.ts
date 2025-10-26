import { InfluxDB, Point } from "@influxdata/influxdb-client";
import "dotenv/config";
import { hostname } from "node:os";
import GlancesAPI from "./GlancesAPI";

const influxUrl = process.env.INFLUX_URL;
const influxToken = process.env.INFLUX_TOKEN;
const influxOrg = process.env.INFLUX_ORG;
const influxBucket = process.env.INFLUX_BUCKET;

const glancesApiUrl = process.env.GLANCES_API_URL;

const intervalMS = parseInt(process.env.INTERVAL_S || "10", 10) * 1000;

if (
  !influxUrl ||
  !influxToken ||
  !influxOrg ||
  !influxBucket ||
  !glancesApiUrl
) {
  throw new Error(
    "Missing InfluxDB or Glances API configuration in environment variables."
  );
}

const glancesApi = new GlancesAPI(glancesApiUrl);

const writeApi = new InfluxDB({
  url: influxUrl,
  token: influxToken,
}).getWriteApi(influxOrg, influxBucket, "ns");
writeApi.useDefaultTags({ location: hostname() });

const writePoint = async () => {
  const { cpu, system, mem, sensors, network, fs } = await glancesApi.all();
  const timestamp = new Date();

  const points: Point[] = [];

  const cpuPoint = new Point("cpu")
    .timestamp(timestamp)
    .tag("host", system.hostname)
    .floatField("total", cpu.total)
    .floatField("idle", cpu.idle)
    .floatField("user", cpu.user)
    .floatField("system", cpu.system);
  points.push(cpuPoint);

  const memPoint = new Point("mem")
    .timestamp(timestamp)
    .tag("host", system.hostname)
    .intField("total", mem.total)
    .intField("available", mem.available)
    .intField("used", mem.used)
    .intField("free", mem.free)
    .floatField("percent", mem.percent);
  points.push(memPoint);

  for (const sensor of sensors) {
    const sensorPoint = new Point("sensor")
      .timestamp(timestamp)
      .tag("host", system.hostname)
      .tag("key", sensor.label)
      .stringField("unit", sensor.unit)
      .floatField("value", sensor.value);
    points.push(sensorPoint);
  }

  for (const net of network) {
    const netPoint = new Point("network")
      .timestamp(timestamp)
      .tag("host", system.hostname)
      .tag("interface", net.interface_name)
      .intField("bytes_sent", net.bytes_sent)
      .intField("bytes_recv", net.bytes_recv)
      .intField("speed", net.speed);
    points.push(netPoint);
  }

  for (const filesystem of fs) {
    const fsPoint = new Point("filesystem")
      .timestamp(timestamp)
      .tag("host", system.hostname)
      .tag("key", filesystem.device_name)
      .intField("used", filesystem.used)
      .intField("free", filesystem.free)
      .floatField("percent", filesystem.percent);
    points.push(fsPoint);
  }

  writeApi.writePoints(points);
};

setInterval(async () => {
  try {
    await writePoint();
    console.log("Data written to InfluxDB successfully.");
  } catch (error) {
    console.error("Error fetching data from Glances API:", error);
  }
}, intervalMS);
