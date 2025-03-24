import Movie from "../models/movie";
import { getMoviesByGenre } from "../controllers/movie";
import request from "supertest";
import app from "../index";

jest.mock("../models/Movie");

describe("get movies list by genreId (unit testcase)", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      user: true,
      params: { genre: "35" },
      query: {
        page: "1",
        limit: "10",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return 400 if user is not logged in", async () => {
    mockRequest.user = null;

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Access denied, Please login",
    });
  });

  it("should return 400 if genre parameter is missing", async () => {
    mockRequest.params.genre = null;

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Genre parameter is required.",
    });
  });

  it("should return 400 if genre ID is invalid", async () => {
    mockRequest.params.genre = "invalid";

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Genre ID must be a positive integer (≥1)",
    });
  });

  it("should return 400 if page number is invalid", async () => {
    mockRequest.query.page = "0";

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Page must be a positive integer (≥1)",
    });
  });

  it("should return 400 if limit is invalid", async () => {
    mockRequest.query.limit = "101";

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Limit must be a positive integer (1-100)",
    });
  });

  it("should return 200 with empty movie list if no movies found", async () => {
    (Movie.aggregate as jest.Mock).mockResolvedValue([]);

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "no Movies available with given genreId",
    });
  });

  it("should return 200 with movie list if movies are found", async () => {
    const mockMovieData = [
      {
        _id: "1",
        title: "Test Movie",
        description: "Test description",
        genres: [1],
        languages: ["English"],
        releaseDate: "2024-01-01",
        rating: 4.5,
        poster: "test.jpg",
        availableForStreaming: true,
      },
    ];

    (Movie.aggregate as jest.Mock).mockResolvedValue(mockMovieData);
    (Movie.countDocuments as jest.Mock).mockResolvedValue(1);

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      metadata: {
        totalMovies: 1,
        currentPage: 1,
        totalPages: 1,
      },
      message: "list of Movies",
      data: { moviesList: mockMovieData },
    });
  });

  it("should handle pagination correctly", async () => {
    mockRequest.query.page = "2";
    mockRequest.query.limit = "5";

    const mockMovieData = [
      {
        _id: "1437985773",
        title: "John Wick",
        description: "vfdn vdnnbnvf",
        genres: [1, 35],
        languages: ["English"],
        releaseDate: "2020-08-24",
        rating: 7.8,
        poster: "test.jpg",
        availableForStreaming: true,
      },
    ];

    (Movie.aggregate as jest.Mock).mockResolvedValue(mockMovieData);
    (Movie.countDocuments as jest.Mock).mockResolvedValue(8);

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(Movie.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $skip: 5 }),
        expect.objectContaining({ $limit: 5 }),
      ])
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      metadata: {
        totalMovies: 8,
        currentPage: 2,
        totalPages: 2,
      },
      message: "list of Movies",
      data: { moviesList: mockMovieData },
    });
  });

  it("should return 500 if an error occurs", async () => {
    (Movie.aggregate as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Database error",
    });
  });
});


describe("GET /movies/genre/:genre (Branch Test)", () => {
  const cookie =
    "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2QyODg0YTAwYjlmMGZiYWQyYWRhMGQiLCJpYXQiOjE3NDI3Mzg3MDAsImV4cCI6MTc0MzM0MzUwMH0.4k7WpL01Rb6VNDJLRqry05uEIZB-vT3B2V3vY029ekY";

  // Incase of user not logged in
  it("should return 400 if the user is not logged in", async () => {
    const response = await request(app).get("/movies/genre/80");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please Login");
  });

  // Incase of given token is Invalid
  it("should return 400 if the token is invalid", async () => {
    const response = await request(app)
      .get("/movies/genre/80")
      .set("Cookie", cookie + "wef");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("invalid signature");
  });

  // Incase of genreId is invalid
  it("should return 400 for an invalid genre ID", async () => {
    const response = await request(app)
      .get("/movies/genre/invalid")
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Genre ID must be a positive integer (≥1)"
    );
  });

  // Incase of page number is invalid
  it("should return 400 for an invalid page number", async () => {
    const response = await request(app)
      .get("/movies/genre/80?page=0")
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Page must be a positive integer (≥1)"
    );
  });

  // Incase of limit number is invalid
  it("should return 400 for an invalid limit number", async () => {
    const response = await request(app)
      .get("/movies/genre/80?limit=101")
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Limit must be a positive integer (1-100)"
    );
  });

  // Incase of every input is properly provided
  it("should return a list of movies for a valid genre", async () => {
    const response = await request(app)
      .get("/movies/genre/80?page=1&limit=2")
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("list of Movies");
    expect(response.body).toHaveProperty('metadata');
    expect(response.body).toHaveProperty('data.moviesList');
    expect(Array.isArray(response.body.data.moviesList)).toBe(true);
  });

  // Incase of there is no movie with given genreId
  it("should return 200 with appropriate message if no movies exist for the genre", async () => {
    const response = await request(app)
      .get("/movies/genre/999?page=1&limit=10")
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "no Movies available with given genreId"
    );
  });

  // Test pagination functionality
  it("should return correct pagination metadata", async () => {
    const response = await request(app)
      .get("/movies/genre/80?page=2&limit=5")
      .set("Cookie", cookie);

    if (response.body.data) {  // If movies exist
      expect(response.body.metadata).toHaveProperty('totalMovies');
      expect(response.body.metadata).toHaveProperty('currentPage', 2);
      expect(response.body.metadata).toHaveProperty('totalPages');
      expect(response.body.data.moviesList.length).toBeLessThanOrEqual(5);
    }
  });

  // Incase of any DB error occurred
  it("should return 500 if an internal server error occurs", async () => {
    jest
      .spyOn(Movie, "aggregate")
      .mockRejectedValueOnce(new Error("DB error"));

    const response = await request(app)
      .get("/movies/genre/1?page=1&limit=10")
      .set("Cookie", cookie);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("DB error");

    jest.restoreAllMocks();
  });

  // Test default pagination values
  it("should use default pagination values when not provided", async () => {
    const response = await request(app)
      .get("/movies/genre/80")
      .set("Cookie", cookie);

    if (response.body.data) {  // If movies exist
      expect(response.body.metadata.currentPage).toBe(1);
      expect(response.body.data.moviesList.length).toBeLessThanOrEqual(10);
    }
  });

  // Test movie data structure
  it("should return movies with correct data structure", async () => {
    const response = await request(app)
      .get("/movies/genre/80?page=1&limit=1")
      .set("Cookie", cookie);

    if (response.body.data && response.body.data.moviesList.length > 0) {
      const movie = response.body.data.moviesList[0];
      expect(movie).toHaveProperty('title');
      expect(movie).toHaveProperty('description');
      expect(movie).toHaveProperty('genres');
      expect(movie).toHaveProperty('languages');
      expect(movie).toHaveProperty('releaseDate');
      expect(movie).toHaveProperty('rating');
      expect(movie).toHaveProperty('poster');
      expect(movie).toHaveProperty('availableForStreaming');
    }
  });
}); 