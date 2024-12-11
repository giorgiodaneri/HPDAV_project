import re

mapClass = {
  "DNS Root"         : 0,
  "Website"          : 1,
  "Firewall-1"       : 2,
  "Firewall-2"       : 3,
  "Domain Controller": 4,
  "Log server"       : 5,
  "Financial Servers": 6,
  "WorkStation"      : 7,
  "Data Center"      : 8,
  "Unknown"          : 9,
}

mapPathToFirewall = {
    (1,7) : 2,
    (7,1) : 3,
    (1, 9): 2,
    (9, 1): 3,
    (1, 0): 9,
    (0, 1): 9,
    (3, 8): 2,
    (8, 3): 3,
    (2, 8): 2,
    (8, 2): 3,
    (4, 5): 2,
    (5, 4): 3,
    (4, 6): 2,
    (6, 4): 9,
    (4, 7): 9,
    (7, 4): 9,
    (7, 7): 9,
    (4, 9): 9,
    (9, 4): 9,
    (4, 0): 9,
    (0, 4): 9,
    (5, 6): 9,
    (6, 5): 9,
    (5, 7): 9,
    (7, 5): 9,
    (5, 9): 9,
    (9, 5): 9,
    (5, 0): 9,
    (0, 5): 9,
    (6, 7): 9,
    (7, 6): 9,
    (6, 9): 9,
    (9, 6): 9,
    (6, 0): 9,
    (0, 6): 9,
    (7, 9): 9,
    (9, 7): 9,
    (7, 0): 9,
    (0, 7): 9,
    (9, 0): 9,
    (0, 9): 9,
    (2, 3): 9,
    (3, 2): 9,
    (2, 9): 9,
    (9, 2): 9,
    (2, 0): 9,
    (0, 2): 9,
    (3, 9): 9,
    (9, 3): 9,
    (3, 0): 9,
    (0, 3): 9,
    (8, 9): 9,
    (9, 8): 9,
    (8, 0): 9,
    (0, 8): 9,
    (9, 0): 9,
    (0, 9): 9,
    (2, 4): 9,
    (4, 2): 9,
    (9, 9): 9,

}
IPClassifications = {
  # DNS Root Servers
  "198.41.0.4"    : "DNS Root",
  "128.9.0.107"   : "DNS Root",
  "192.33.4.12"   : "DNS Root",
  "128.8.10.90"   : "DNS Root",
  "192.203.230.10": "DNS Root",
  "192.5.5.241"   : "DNS Root",
  "192.112.36.4"  : "DNS Root",
  "128.63.2.53"   : "DNS Root",
  "192.36.148.17" : "DNS Root",
  "192.58.128.30" : "DNS Root",
  "193.0.14.129"  : "DNS Root",
  "198.32.64.12"  : "DNS Root",
  "202.12.27.33"  : "DNS Root",

  # Website
  "10.32.0.[201-210]" : "Website",
  "10.32.1.100"       : "Website",
  "10.32.1.[201-206]" : "Website",
  "10.32.5.X" : "Website",

  # Firwalls
  "10.32.0.100" : "Data Center",
  "10.32.0.1"   : "Firewall-2",

  # Regional Bank Network
  "172.23.0.10": "Domain Controller",

  "172.23.0.2": "Log server",

  "172.23.[214-229].X": "Financial Servers",

  "172.23.[0-213].X"    : "WorkStation",
  "172.23.[230-255].X"  : "WorkStation",
}

def ip_in_range(ip, pattern):
    ip_parts = ip.split('.')
    pattern_parts = pattern.split('.')
    
    for ip_part, pattern_part in zip(ip_parts, pattern_parts):
        if '[' in pattern_part and ']' in pattern_part:
            range_start, range_end = map(int, pattern_part[1:-1].split('-'))
            if not (range_start <= int(ip_part) <= range_end):
                return False
        elif pattern_part == 'X':
            continue
        elif ip_part != pattern_part:
            return False
    return True

def get_ip_type(ip):
    for pattern, ip_type in IPClassifications.items():
        if ip_in_range(ip, pattern):
            return mapClass[ip_type]
    return "Unknown"

def get_path_type(source, desination):
    return mapPathToFirewall[(source, desination)]

