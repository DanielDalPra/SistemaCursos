const createCourseRouter = require('./course-router.cjs');
const courses = require('./catalog.cjs');
module.exports = (WIKI, express) => {
  const router = express.Router();
  for (const course of courses) router.use(createCourseRouter(WIKI, express, course));
  return router;
};
