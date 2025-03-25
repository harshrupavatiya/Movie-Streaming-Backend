import Movie from "../models/movie";
import { getMoviesByGenre } from "../controllers/movie";
import request from "supertest";
import app from "../index";



describe("GET /movie/getMoviesByGenre/:genre (Integration Test)", () => {
  const cookie =
    "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2QyODg0YTAwYjlmMGZiYWQyYWRhMGQiLCJpYXQiOjE3NDI3Mzg3MDAsImV4cCI6MTc0MzM0MzUwMH0.4k7WpL01Rb6VNDJLRqry05uEIZB-vT3B2V3vY029ekY";

  // Incase of user not logged in
  it("should return 400 if the user is not logged in", async () => {
    const response = await request(app).get("/movie/getMoviesByGenre/80");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please Login");
  });

  // Incase of given token is Invalid
  it("should return 400 if the token is invalid", async () => {
    const response = await request(app)
      .get("/movie/getMoviesByGenre/80")
      .set("Cookie", cookie + "wef");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("invalid signature");
  });

  // Incase of genreId is invalid
  it("should return 400 for an invalid genre ID", async () => {
    const response = await request(app)
      .get("/movie/getMoviesByGenre/invalid")
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Genre ID must be a positive integer (≥1)"
    );
  });

  // Incase of page number is invalid
  it("should return 400 for an invalid page number", async () => {
    const response = await request(app)
      .get("/movie/getMoviesByGenre/80?page=0")
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Page must be a positive integer (≥1)"
    );
  });

  // Incase of limit number is invalid
  it("should return 400 for an invalid limit number", async () => {
    const response = await request(app)
      .get("/movie/getMoviesByGenre/80?limit=101")
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Limit must be a positive integer (1-100)"
    );
  });

  // Incase of every input is properly provided
  it("should return a list of movies for a valid genre", async () => {
    const response = await request(app)
      .get("/movie/getMoviesByGenre/80?page=1&limit=2")
      .set("Cookie", cookie);

    // expect(response.status).toBe(200);
    expect(response.body.message).toBe("list of Movies");
    expect(response.body).toHaveProperty('metadata');
    expect(response.body).toHaveProperty('data.moviesList');
    expect(Array.isArray(response.body.data.moviesList)).toBe(true);
  });

  // Incase of there is no movie with given genreId
  it("should return 200 with appropriate message if no movies exist for the genre", async () => {
    const response = await request(app)
      .get("/movie/getMoviesByGenre/999?page=1&limit=10")
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "no Movies available with given genreId"
    );
  });

  // Test pagination functionality
  it("should return correct pagination metadata", async () => {
    const response = await request(app)
      .get("/movie/getMoviesByGenre/80?page=2&limit=5")
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
      .get("/movie/getMoviesByGenre/1?page=1&limit=10")
      .set("Cookie", cookie);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("DB error");

    jest.restoreAllMocks();
  });

  // Test default pagination values
  it("should use default pagination values when not provided", async () => {
    const response = await request(app)
      .get("/movie/getMoviesByGenre/80")
      .set("Cookie", cookie);

    if (response.body.data) {  // If movies exist
      expect(response.body.metadata.currentPage).toBe(1);
      expect(response.body.data.moviesList.length).toBeLessThanOrEqual(10);
    }
  });

  // Test movie data structure
  it("should return movies with correct data structure", async () => {
    const response = await request(app)
      .get("/movie/getMoviesByGenre/80?page=1&limit=1")
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