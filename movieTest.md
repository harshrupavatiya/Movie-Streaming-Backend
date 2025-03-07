# APIs
1 - string
2 - number
3 - ObjectId
4 - img file
5 - video file
[1] - string[]
[2] - number[]
[3] - ObjectId[]

## /movie

-  AddMovie - /createMovie - POST
--  body -> title 1*, description 1,genres [2]* , duration 2*, rating 2* , casts [3]* , directors [3]* , languages [1]* , availableForStreaming [1] , poster 4* , trailer 5*, movie 5*

- GetMovie - /getMovieById/:movieId - GET
-- give movieId at last instead of :movieId


