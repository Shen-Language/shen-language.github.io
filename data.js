var latestKernelVersion = 21.1;
var recentKernelVersion = 19.2;

var ports = [
    {
        platform: "Common Lisp",
        url: "https://github.com/Shen-Language/shen-cl",
        kernel: "21.1",
        certified: true
    },
    {
        platform: "C",
        url: "https://github.com/otabat/shen-c",
        kernel: "20.0",
        certified: true
    },
    {
        platform: "CLR",
        url: "https://github.com/rkoeninger/ShenSharp",
        kernel: "21.1",
        certified: true
    },
    {
        platform: "Emacs Lisp",
        url: "https://github.com/deech/shen-elisp",
        kernel: "20.0",
        certified: true
    },
    {
        platform: "Erlang",
        url: "https://github.com/sborrazas/shen-erl",
        kernel: "21.1",
        certified: true
    },
    {
        platform: "Go",
        url: "https://github.com/tiancaiamao/shen-go",
        kernel: "21.0",
        certified: true
    },
    {
        platform: "Haskell",
        url: "https://github.com/mthom/shentong",
        kernel: "20.0",
        certified: true
    },
    {
        platform: "Java",
        url: "https://github.com/otabat/shen-jvm",
        kernel: "21.0",
        certified: true
    },
    {
        platform: "Ruby",
        url: "https://github.com/gregspurrier/shen-ruby",
        kernel: "19.2",
        certified: true
    },
    {
        platform: "Scheme",
        url: "https://github.com/tizoc/shen-scheme",
        kernel: "21.0",
        certified: true
    },
    {
        platform: "Truffle",
        url: "https://github.com/ragnard/shen-truffle",
        kernel: "20.0",
        certified: true
    },
    {
        platform: "Wasp Lisp",
        url: "https://github.com/doublec/shen-wasp",
        kernel: "21.1",
        certified: true
    },
    {
        platform: "JavaScript",
        url: "https://github.com/gravicappa/shen-js",
        kernel: "19.2"
    },
    {
        platform: "JavaScript",
        url: "https://github.com/rkoeninger/ShenScript",
        kernel: "21.0"
    },
    {
        platform: "C++",
        url: "https://github.com/wehu/ShenCPP",
        kernel: "11.0"
    },
    {
        platform: "Clojure",
        url: "https://github.com/hraberg/shen.clj",
        kernel: "17.3"
    },
    {
        platform: "Java",
        url: "https://github.com/hraberg/Shen.java",
        kernel: "13.2.1"
    },
    {
        platform: "Python",
        url: "https://github.com/gravicappa/shen-py",
        kernel: "14.0"
    },
    {
        platform: "Python",
        url: "https://github.com/yminer/pyshen",
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
