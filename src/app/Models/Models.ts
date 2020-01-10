export class M3U {
  constructor(value?: Partial<M3U>) {
    this.entries = new Array<M3UEntry>();
    if (value) {
      Object.assign(this, value);
    }
  }

  entries: Array<M3UEntry>;
}

export class M3UEntry {
  constructor(value?: Partial<M3UEntry>) {
    this.src = '';
    this.title = '';
    this.duration = 0;
    this.attributes = [];
    if (value) {
      Object.assign(this, value);
    }
  }

  src: string;
  title: string;
  duration: number;
  attributes: Array<M3UEntryAttribute>
}


export class M3UEntryAttribute {
	constructor(value?: Partial<M3UEntryAttribute>) {
		if (value) {
			Object.assign(this, value);
		}
	}

	[key: string]: string;
}