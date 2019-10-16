(load "data.shen")
(load "utils.shen")
(load "fetch.shen")

(define string-contains
  S T -> (>= ((. S "indexOf") T) 0))

(define link-icon
  Url -> "far fa-envelope" where (string-contains Url "mailto:")
  Url -> "fab fa-github"   where (string-contains Url "github.com")
  _   -> "fas fa-link")

(define link
  Url Name -> [span [i [@class (link-icon Url)]] [a [@href Url] Name]])

(define version-attributes
  Kernel -> [[@class "latest"] [@title "Up-to-date with the latest"]]      where (>= Kernel (value *latest-kernel-version*))
  Kernel -> [[@class "recent"] [@title "Compatible with recent versions"]] where (>= Kernel (value *recent-kernel-version*))
  _      -> [[@class "outdated"] [@title "Several versions out-of-date"]])

(define port-row
  Port ->
    [tr
      [td (. Port "platform")]
      [td
        (link
          (js.raw.or (. Port "url") (@s "https://github.com/" (. Port "github")))
          (js.raw.or (. Port "name") (after-last-slash (js.raw.or (. Port "github") (. Port "url")))))]
      [td (. Port "kernel") | (version-attributes (js.parse-float (. Port "kernel")))]])

(define ports-table
  Certified Uncertified ->
    [table
      [thead [tr [th "Platform"] [th "Port"] [th "Kernel"]]]
      [tbody |
        (append
          [[tr [th [@colspan 3] "Certified"]]   | (map (function port-row) Certified)]
          [[tr [th [@colspan 3] "Uncertified"]] | (map (function port-row) Uncertified)])]])

(define setup-downloads-table ->
  (let NonArchival (filter (/. P (js.falsy? (. P "archival"))) (value *ports*))
       Sorted      (sort-by (/. P (. P "platform")) NonArchival)
       Certified   (filter (/. P (js.truthy? (. P "certified"))) Sorted)
       Uncertified (filter (/. P (js.falsy?  (. P "certified"))) Sorted)
    (dom.replace
      (dom.query "#downloads-table")
      (dom.build
        (ports-table Certified Uncertified)))))

(define contributor-row
  C ->
    [tr
      (sift
        [td (js.raw.or (. C "name") (. C "github"))])
      (sift
        [td
          (js.raw.and (. C "github") (link (@s "https://github.com/" (. C "github")) (. C "github")))
          (js.raw.and (. C "blog")   (link (. C "blog") "blog"))])])

(define community-table
  Contributors ->
    [table
      [thead [tr [th "Contributor"] [th "Links"]]]
      [tbody |
        (map (function contributor-row)
          (sort-by (/. C ((. (js.raw.or (js.raw.or (. C "name") (. C "github")) "") "toLowerCase")))
            Contributors))]])

(define setup-community-table ->
  (dom.replace
    (dom.query "#community-table")
    (dom.build
      (trap-error
        (community-table (sift (load-contributors)))
        (/. E
          (do
            ((. (js.console) "error") E)
            [div
              [p "Unable to load contributors"]
              [p "GitHub rate limit may be expended, try again later"]]))))))

(define scroll-to-anchor ->
  (let Hash (. (web.document) "location" "hash")
    (if (and (js.truthy? Hash) (> (. Hash "length") 0))
      ((. (dom.query (@s "#" (tlstr Hash))) "scrollIntoView"))
      ())))

(dom.onready
  (freeze
    (do
      (setup-downloads-table)
      (setup-community-table)
      (scroll-to-anchor))))
