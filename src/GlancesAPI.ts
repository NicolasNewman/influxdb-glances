type Sensors = {
  label: string;
  unit: string;
  value: number | string;
  warning: number | null;
  critical: number | null;
  type: string;
  key: string;
}[];

type Mem = {
  total: number;
  available: number;
  percent: number;
  used: number;
  free: number;
  [key: string]: string | number | null;
};

type Gpu = {
  key: string;
  gpu_id: string;
  name: string;
  mem: number;
  proc: number;
  temperature: number;
  fan_speed: number | null;
}[];

type Fs = {
  device_name: string;
  fs_type: string;
  mnt_point: string;
  options: string;
  size: number;
  used: number;
  free: number;
  percent: number;
  key: string;
}[];

type Network = {
  bytes_sent: number;
  bytes_recv: number;
  speed: number;
  key: string;
  interface_name: string;
  alias: string | null;
  [key: string]: number | string | null;
}[];

type Cpu = {
  total: number;
  system: number;
  user: number;
  idle: number;
  [key: string]: number | string | null;
};

type PerCpu = {
  key: string;
  cpu_number: number;
  total: number;
  system: number;
  user: number;
  idle: number;
  [key: string]: number | string | null;
};

type System = {
  os_name: string;
  hostname: string;
  platform: string;
  os_version: string;
};

class GlancesAPI {
  constructor(private apiUrl: string) {}

  async all() {
    const sensors = await this.sensors();
    const mem = await this.mem();
    const gpu = await this.gpu();
    const fs = await this.fs();
    const network = await this.network();
    const cpu = await this.cpu();
    const perCpu = await this.perCpu();
    const system = await this.system();

    return {
      sensors,
      mem,
      gpu,
      fs,
      network,
      cpu,
      perCpu,
      system,
    };
  }

  async sensors() {
    const response = await fetch(`${this.apiUrl}/api/4/sensors`);
    if (!response.ok) {
      throw new Error("Failed to fetch sensors");
    }
    return (await response.json()) as Sensors;
  }

  async mem() {
    const response = await fetch(`${this.apiUrl}/api/4/mem`);
    if (!response.ok) {
      throw new Error("Failed to fetch memory data");
    }
    return (await response.json()) as Mem;
  }

  async gpu() {
    const response = await fetch(`${this.apiUrl}/api/4/gpu`);
    if (!response.ok) {
      throw new Error("Failed to fetch GPU data");
    }
    return (await response.json()) as Gpu;
  }

  async fs() {
    const response = await fetch(`${this.apiUrl}/api/4/fs`);
    if (!response.ok) {
      throw new Error("Failed to fetch filesystem data");
    }
    return (await response.json()) as Fs;
  }

  async network() {
    const response = await fetch(`${this.apiUrl}/api/4/network`);
    if (!response.ok) {
      throw new Error("Failed to fetch network data");
    }
    return (await response.json()) as Network;
  }

  async cpu() {
    const response = await fetch(`${this.apiUrl}/api/4/cpu`);
    if (!response.ok) {
      throw new Error("Failed to fetch CPU data");
    }
    return (await response.json()) as Cpu;
  }

  async perCpu() {
    const response = await fetch(`${this.apiUrl}/api/4/percpu`);
    if (!response.ok) {
      throw new Error("Failed to fetch per-CPU data");
    }
    return (await response.json()) as PerCpu;
  }

  async system() {
    const response = await fetch(`${this.apiUrl}/api/4/system`);
    if (!response.ok) {
      throw new Error("Failed to fetch system data");
    }
    return (await response.json()) as System;
  }
}

export default GlancesAPI;
