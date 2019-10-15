(define filter
  _ []       -> []
  F [X | Xs] -> [X | (filter F Xs)] where (F X)
  F [_ | Xs] -> (filter F Xs))

(define flatten
  []       -> []
  [X | Xs] -> (mapcan (function flatten) [X | Xs])
  X        -> [X])

(define sift
  Xs -> (filter (/. X (not (or (js.undefined? X) (js.null? X)))) Xs))

(define distinct
  Xs -> (reverse (distinct-onto Xs [])))

(define distinct-onto
  []       Ys -> Ys
  [X | Xs] Ys -> (distinct-onto Xs Ys) where (element? X Ys)
  [X | Xs] Ys -> (distinct-onto Xs [X | Ys]))

(define before-last-slash
  S ->
    (let I ((. S "lastIndexOf") "/")
      (if (< I 0) S ((. S "substring") 0 I))))

(define after-last-slash
  ""         -> ""
  (@s "/" S) -> S
  (@s _   S) -> (after-last-slash S))
