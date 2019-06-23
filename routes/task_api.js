const router = require('koa-router')()
const task_controller = require('../controller/taskController')
const tr_controller = require('../controller/trController')

router.prefix('/api/v1')

router.post('/task', task_controller.releaseTask);
router.del('/task', task_controller.deleteTaskByTaskID);


// 获得TASK，通过range, type, username
router.get('/task', task_controller.searchTask);
router.get('/task/findByPublisher', task_controller.searchTaskByUserRelease);
router.get('/task/findByTaskId', task_controller.searchTaskById);
router.get('/task/findByAccepter', task_controller.searchTaskByAccepter);


// get accepter
router.get('/task/accepter', tr_controller.searchByTaskId);
router.post('/task/complement', tr_controller.completeTask);
router.post('/task/comfirm', tr_controller.confirmComplement);
router.get('/task/acceptance', tr_controller.searchTR);
router.post('/task/acceptance', tr_controller.recieveATask);
router.del('/task/acceptance', tr_controller.deleteTR);



router.post('/task/questionnaire', tr_controller.submitQuestionnaire);

module.exports = router;
