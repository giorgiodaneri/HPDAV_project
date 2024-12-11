const map = {
"DNS Root": 0,
"Firewall-1": 1,
"Internal Network": 2,
"Domain Controller": 3,
"Log server": 4,
"Unknown": 5
}

const IPClassification = {
  // DNS Root Servers IP Addresses
  "198.41.0.4": "DNS Root",
  "128.9.0.107": "DNS Root",
  "192.33.4.12": "DNS Root",
  "128.8.10.90": "DNS Root",
  "192.203.230.10": "DNS Root",
  "192.5.5.241": "DNS Root",
  "192.112.36.4": "DNS Root",
  "128.63.2.53": "DNS Root",
  "192.36.148.17": "DNS Root",
  "192.58.128.30": "DNS Root",
  "193.0.14.129": "DNS Root",
  "198.32.64.12": "DNS Root",
  "202.12.27.33": "DNS Root",

  // Firwall
  "10.32.0.100": "Firewall-1",
  // Regional Bank Network
  "172.23.0.10": "Domain Controller",

  "172.23.0.2": "Log server",

  "172.23.214.X": "Domain Controller",

  "172.23.214.X": "Domain Controller",

  "172" : 
    {"23": 
      {"214": 
        {"X": "Domain Controller"}
      }
    }
};

// Funzione per convertire un IP in un array di numeri per facilitare i confronti
const ipToNumber = (ip) => {
  return ip.split('.').map(Number).reduce((acc, num) => (acc << 8) | num, 0);
};

// Definisci gli intervalli di IP
const IPRanges = [
  { range: [ipToNumber('10.32.0.201'), ipToNumber('10.32.0.210')], classification: "Internal Network" },
  { range: [ipToNumber('198.41.0.4'), ipToNumber('198.41.0.20')], classification: "DNS Root" },
  // Aggiungi altri intervalli qui
];

// Funzione per classificare un IP
const classifyIP = (ip) => {
  const ipNum = ipToNumber(ip);
  for (let range of IPRanges) {
    const [start, end] = range.range;
    if (ipNum >= start && ipNum <= end) {
      return range.classification;
    }
  }
  return "Unknown"; // Se non rientra in nessun intervallo
};

// Esempi di utilizzo
console.log(classifyIP("10.32.0.205")); // Output: "Internal Network"
console.log(classifyIP("198.41.0.10"));  // Output: "DNS Root"
console.log(classifyIP("192.168.1.1"));  // Output: "Unknown"
