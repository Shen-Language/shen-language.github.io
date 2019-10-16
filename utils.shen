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

(define vector->list-h
  0 _ Xs -> Xs
  I V Xs -> (vector->list-h (- I 1) V [(<-vector V I) | Xs]))

(define vector->list
  V -> (vector->list-h (limit V) V []))

(define list->vector-h
  _ V []       -> V
  I V [X | Xs] ->
    (do
      (vector-> V I X)
      (list->vector-h (+ I 1) V Xs)))

(define list->vector
  Xs -> (list->vector-h 1 (vector (length Xs)) Xs))

(define vector-swap
  V I J ->
    (let X (<-vector V I)
      (do
        (vector-> V I (<-vector V J))
        (vector-> V J X)
        V)))

(define bubble-sort
  F 1 _ V -> V
  F N I V -> (bubble-sort F (- N 1) 1 V) where (= I (limit V))
  F N I V ->
    (let J      (+ 1 I)
         NoSwap (js.truthy? (js.raw.< (F (<-vector V I)) (F (<-vector V J))))
      (bubble-sort F N J (if NoSwap V (vector-swap V I J)))))

(define sort-vector-by
  F V -> (bubble-sort F (limit V) 1 V))

(define sort-by
  F Xs -> (vector->list (sort-vector-by F (list->vector Xs))))

(define before-last-slash
  S ->
    (let I ((. S "lastIndexOf") "/")
      (if (< I 0) S ((. S "substring") 0 I))))

(define after-last-slash
  S ->
    (let I ((. S "lastIndexOf") "/")
      (if (< I 0) S ((. S "substring") (+ 1 I)))))
