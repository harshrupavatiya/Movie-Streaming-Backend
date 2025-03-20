import express from 'express';
import validate from '../../modules/validate/validate.middleware';
import { userAuth } from '../../modules/auth';

const episodeRouter = express.Router();

// crewRouter.get('/search', userAuth, validate(crewValidation.searchCrew), crewController.searchCrew);
// crewRouter.post('/addOrUpdate',userAuth, validate(crewValidation.addOrUpdateCrew), crewController.addOrUpdateCrew);
// crewRouter.delete('/:castId', userAuth, validate(crewValidation.deleteCrew), crewController.deleteCrew);

export default episodeRouter;
