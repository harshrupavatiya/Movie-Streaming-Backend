import express from 'express';
import validate from '../../modules/validate/validate.middleware';
import crewValidation from '../../modules/crew/crew.validation';
import { crewController } from '../../modules/crew';
import { userAuth } from '../../modules/auth';

const crewRouter = express.Router();

crewRouter.get('/search', userAuth, validate(crewValidation.searchCrew), crewController.searchCrew);
crewRouter.post('/addOrUpdate',userAuth, validate(crewValidation.addOrUpdateCrew), crewController.addOrUpdateCrew);
crewRouter.delete('/:castId', userAuth, validate(crewValidation.deleteCrew), crewController.deleteCrew);

export default crewRouter;
