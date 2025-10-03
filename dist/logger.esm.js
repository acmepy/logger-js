// src/index.js
import fs from "fs";
import dayjs from "dayjs";
var path = "lib/logger";
var LEVELS = { TRACE: 1, DEBUG: 2, INFO: 3, WARN: 4, ERROR: 5, OFF: 99 };
var Logger = class {
  break = [];
  level = 0;
  console = {};
  file = false;
  name = false;
  hideSecrets = false;
  config({ file, name = "my logger", displayConsole = false, level = LEVELS.TRACE, hideSecrets = true }) {
    this.file = file;
    this.name = name;
    this.console = {
      display: displayConsole,
      log: console.log,
      error: console.error
    };
    this.level = level;
    this.hideSecrets = hideSecrets;
  }
  addBreak(break_) {
    this.break.push(break_);
    this.info(path, "addBreak", this.break);
  }
  setName(name) {
    this.name = name;
  }
  /*name(){
    return this.file.substring(this.file.indexOf('data/')+5)
  }*/
  trace(...rest) {
    rest.unshift("TRACE");
    this.log(rest);
  }
  debug(...rest) {
    rest.unshift("DEBUG");
    this.log(rest);
  }
  info(...rest) {
    rest.unshift("INFO");
    this.log(rest);
  }
  warn(...rest) {
    rest.unshift("WARN");
    this.log(rest);
  }
  error(...rest) {
    rest.unshift("ERROR");
    this.log(rest);
  }
  log(rest) {
    rest = this.filterLogger(rest);
    const level = rest.shift();
    const path2 = rest.shift();
    if (this.break.length == 0 && this.level <= LEVELS[level] || this.break.includes(path2) || ["ERROR", "FATAL"].includes(level)) {
      const name = this.name.indexOf("]") > -1 ? this.name : "[" + this.name + "]";
      let tmp = ["[" + dayjs().format("HH:mm:ss") + "]", "[" + level + "]", name, "[" + path2 + "]", ...rest];
      if (this.console.display || ["ERROR", "FATAL"].includes(level)) {
        if (["ERROR", "FATAL"].includes(level)) {
          this.console.error(...tmp);
        } else if (["WARN"].includes(level)) {
          this.console.warn(...tmp);
        } else {
          this.console.log(...tmp);
        }
      }
      if (this.file) {
        tmp.shift();
        tmp = ["[" + dayjs().format("YYYY-MM-DD HH:mm:ss") + "]", ...tmp];
        this.writeFile(this.file, tmp);
      }
    }
  }
  writeFile(fn, data) {
    const dir = fn.split("/").slice(0, -1).join("/");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFile(fn, data + "\n", (err) => {
      if (err) {
        console.error("logger writeFile", err);
      }
    });
  }
  static get levels() {
    return LEVELS;
  }
  /*nodemailer(rest){
      if(typeof rest[1]=='object'){
        let tmp = []
        if(rest[2].indexOf('%s')>=0){
          for(let x=3;x<rest.length;x++){
            tmp.push(rest[x])
          }
          rest[2] = this.formatLog(rest[2], tmp)
        }
        tmp = [rest[0], 'nodemailer']
        if(rest[1]?.sid){
          tmp.push('['+rest[1]?.sid+']')
        }
        tmp.push(rest[2])
        rest = tmp
      }
      return rest
    }
  
    formatLog(message, values){
      const tmp = message.replace(/%[sd]/g, () => values.shift());
      return tmp
    }*/
  filterLogger(rest) {
    var _a, _b;
    for (let r = 0; r < rest.length; r++) {
      if (((_b = (_a = rest[r]) == null ? void 0 : _a.constructor) == null ? void 0 : _b.name) == "Logger") {
        rest.splice(r, 1);
      } else if (rest[r].logger) {
        delete rest[r].logger;
      } else if (rest[r].cert) {
        rest[r].cert = rest[r].cert.substring(0, 10) + "..." + rest[r].cert.substring(rest[r].cert.length - 10);
      } else if (rest[r].password) {
        rest[r].password = rest[r].password.replace(rest[r].password, "*");
      } else if (rest[r].pass && !this.hideSecrets) {
        rest[r].pass = rest[r].pass.replace(rest[r].pass, "*");
      } else if (rest[r].clave && !this.hideSecrets) {
        rest[r].clave = rest[r].clave.replace(rest[r].clave, "*");
      } else if (rest[r].token && !this.hideSecrets) {
        rest[r].token = rest[r].token.replace(rest[r].token, "*");
      } else if (rest[r] instanceof Error) {
        rest[r] = rest[r].message + `
stack:` + rest[r].stack;
      } else if (typeof rest[r] == "object") {
        rest[r] = JSON.stringify(rest[r]);
      } else if (Array.isArray(rest[r])) {
        rest[r] = rest[r].join(",");
      }
    }
    return rest;
  }
};
function createLogger({ file, name = "my logger", displayConsole = false, level = LEVELS.TRACE }) {
  logger.config({ file, name, displayConsole, level });
}
var logger = new Logger();
export {
  createLogger,
  logger
};
//# sourceMappingURL=logger.esm.js.map
