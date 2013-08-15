define (require) ->
  class Path
    constructor: (points) ->
      @points = points || []

    addPoint: (p) ->
      @points.push(p)