(define fetch-contributors ->
  (let OrgUser         "Shen-Language"
       ApiUrl          "https://api.github.com"
       OrgReposUrl     (@s ApiUrl "/orgs/" OrgUser "/repos")
       RepoContribsUrl (/. Repo (@s ApiUrl "/repos/" (. Repo "full_name") "/stats/contributors"))
       ProfileUrl      (/. Login (@s ApiUrl "/users/" Login))
       Repos           (shen-script.array->list (web.fetch-json OrgReposUrl))
       Logins          (map (/. C (. C "author" "login"))
                         (flatten
                           (web.fetch-json* (map RepoContribsUrl Repos))))
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
          "login" (. X "github")
          "name"  (. X "name")
          "blog"  (. X "blog")
        }))
      (filter (/. X (> (. ((. (js.Object) "keys") X) "length") 0))
        (sift Profiles)))))

(define load-contributors ->
  ())
