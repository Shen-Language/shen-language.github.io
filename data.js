var latestKernelVersion = 22.0;
var recentKernelVersion = 20.0;

var timeout = [1, "days"];

var ports = [
  {
    platform: "Common Lisp",
    github: "Shen-Language/shen-cl",
    kernel: "21.2",
    certified: true
  },
  {
    platform: "C",
    github: "otabat/shen-c",
    kernel: "20.1",
    certified: true
  },
  {
    platform: "CLR",
    github: "rkoeninger/ShenSharp",
    kernel: "21.2",
    certified: true
  },
  {
    platform: "Emacs Lisp",
    github: "deech/shen-elisp",
    kernel: "21.0",
    certified: true
  },
  {
    platform: "Erlang",
    github: "sborrazas/shen-erl",
    kernel: "21.1",
    certified: true
  },
  {
    platform: "Go",
    github: "tiancaiamao/shen-go",
    kernel: "21.0",
    certified: true
  },
  {
    platform: "Haskell",
    github: "mthom/shentong",
    kernel: "20.0",
    certified: true
  },
  {
    platform: "Java",
    github: "otabat/shen-jvm",
    kernel: "20.1",
    certified: true
  },
  {
    platform: "Ruby",
    github: "gregspurrier/shen-ruby",
    kernel: "19.1",
    certified: true
  },
  {
    platform: "Scheme",
    github: "tizoc/shen-scheme",
    kernel: "22.1",
    certified: true
  },
  {
    platform: "Truffle",
    github: "ragnard/shen-truffle",
    kernel: "20.1",
    certified: true
  },
  {
    platform: "Wasp Lisp",
    github: "doublec/shen-wasp",
    kernel: "22.0",
    certified: true
  },
  {
    platform: "JavaScript",
    github: "rkoeninger/ShenScript",
    kernel: "22.0",
    certified: true
  },
  {
    platform: "JavaScript",
    github: "gravicappa/shen-js",
    kernel: "19.2"
  },
  {
    platform: "C++",
    github: "wehu/ShenCPP",
    kernel: "11.0"
  },
  {
    platform: "Clojure",
    github: "hraberg/shen.clj",
    kernel: "17.3"
  },
  {
    platform: "Java",
    github: "hraberg/Shen.java",
    kernel: "13.2.1"
  },
  {
    platform: "Python",
    github: "gravicappa/shen-py",
    kernel: "14.0"
  },
  {
    platform: "Python",
    github: "yminer/pyshen",
    kernel: "12.0"
  },
  {
    name: "Shen/SBCL",
    platform: "Windows",
    url: "http://shenlanguage.org/Download/ShenCL.zip",
    kernel: "19.2",
    archival: true
  },
  {
    name: "Shen/SBCL",
    platform: "Linux",
    url: "http://shenlanguage.org/Download/Shen-SBCL-Linux.zip",
    kernel: "19.2",
    archival: true
  },
  {
    name: "Shen/SBCL",
    platform: "macOS",
    url: "http://www.skynet.ie/~poldy/Shen-SBCL-OSX.zip",
    kernel: "19.2",
    archival: true
  },
  {
    name: "Shen/SBCL",
    platform: "CentOS",
    url: "http://www.fractal.zone/downloads/",
    kernel: "21.0",
    archival: true
  },
  {
    name: "Shen/SBCL",
    platform: "Fedora",
    url: "http://www.fractal.zone/downloads/",
    kernel: "21.0",
    archival: true
  },
  {
    name: "Shen/SBCL",
    platform: "Raspberry Pi",
    url: "http://www.fractal.zone/downloads/",
    kernel: "21.0",
    archival: true
  }
];
