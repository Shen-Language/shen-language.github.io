(define fetch-contributors ->
  (let OrgUser         "Shen-Language"
       ApiUrl          "https://api.github.com"
       OrgReposUrl     (@s ApiUrl "/orgs/" OrgUser "/repos")
       RepoContribsUrl (/. Repo (@s ApiUrl "/repos/" (. Repo "full_name") "/stats/contributors"))
       ProfileUrl      (/. Login (@s ApiUrl "/users/" Login))
       Repos           (shen-script.array->list (web.fetch-json OrgReposUrl))
       Logins          (map (/. C (. C "author" "login"))
                         (flatten
                           (map (function shen-script.array->list)
                             (web.fetch-json* (map RepoContribsUrl Repos)))))
       Maintainers     (filter (/. U (not (= U OrgUser)))
                         (map (function before-last-slash)
                           (sift
                             (map (/. P (. P "github"))
                               (value *ports*)))))
       Profiles        (web.fetch-json*
                         (map ProfileUrl
                           (distinct
                             (append Logins Maintainers))))
    (map
      (/. X
        ({
          "github" (. X "login")
          "name"   (. X "name")
          "blog"   (. X "blog")
        }))
      (filter (/. X (> (. ((. (js.Object) "keys") X) "length") 0))
        (sift Profiles)))))

(define local-get
  Key -> ((. (web.window) "localStorage" "getItem") Key))

(define local-set
  Key Value -> ((. (web.window) "localStorage" "setItem") Key Value))

(define json-parse
  X -> ((. (js.JSON) "parse") X) where (string? X)
  _ -> (js.undefined))

(define json-stringify
  X -> ((. (js.JSON) "stringify") X))

(define fetch-and-set-contributors
  Key ->
    (let Fetched (fetch-contributors)
         Now     (get-time unix)
         Cached  ({
                   "timestamp" Now
                   Key         (shen-script.list->array Fetched)
                 })
      (do
        (local-set Key (json-stringify Cached))
        Fetched)))

(define load-contributors ->
  (let Key    "contributors"
       Cached (json-parse (local-get Key))
    (if (js.truthy? Cached)
      (let Timestamp (. Cached "timestamp")
           Timeout   (value *timeout*)
           Now       (get-time unix)
        (if (and (number? Timestamp) (< Now (+ Timestamp Timeout)))
          (shen-script.array->list (. Cached Key))
          (fetch-and-set-contributors Key)))
      (fetch-and-set-contributors Key))))
