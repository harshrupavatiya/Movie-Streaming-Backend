import { Response } from "express";
import { AuthRequest } from "../types/api";
import Series from "../models/series";
import Episode from "../models/episode";
import { ADMIN } from "../utils/constants";

export const deleteSeason = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // ensure user is admin
    if (req?.user?.role !== ADMIN) {
      res.status(400).json({ message: " Access denied, Admins only" });
    }

    // get info from parameters
    const { seriesId } = req.params;
    const { season } = req.query;

    if (!seriesId || !season) {
      res
        .status(400)
        .json({ message: "Series Id and Season both field are required." });
    }

    // find series in series collection
    const series = await Series.findById(seriesId);

    if (!series) {
      res.status(400).json({ message: "Invalid series ID" });
      return;
    }

    // convert season into number
    const seasonNumber = parseInt(season as string, 10);

    if (isNaN(seasonNumber)) {
      res.status(400).json({ message: "season should be in numeric format" });
      return;
    }

    // deleting all episode with given series ID and seasonNumber
    const deletedEpisodes = await Episode.deleteMany({
      seriesId,
      seasonNumber,
    });

    res
      .status(200)
      .json({
        message: `All episode are deleted of season number ${seasonNumber}`,
      });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};
