import { EventEmitter } from "events";

export default class DictEmitter extends EventEmitter {
  constructor() {
    super();
    this.dict = {};
  }
  add(id, data) {
    this.dict[id] = data;
    this.emit("add", data);
  }
  delete(id) {
    this.emit("delete", this.dict[id]);
    delete this.dict[id];
  }
  has(id) {
    return id in this.dict;
  }
  keys() {
    return Object.freeze(Object.keys(this.dict));
  }
  values() {
    return Object.freeze(Object.values(this.dict));
  }
}