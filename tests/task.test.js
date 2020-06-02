const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { 
    userOneId, 
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree, 
    setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task for user', async() => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Finish testing'
        })
        .expect(201)
    
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should not create task with invalid description/completed', async() => {
    await request(app)
        .post('/tasks')
        .send({
            description: 123
        })
        .expect(401)
})

test('Should get tasks', async() => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    expect(response.body.length).toEqual(2)
})

test('Should not update task with invalid description/completed', async () => {
    await request(app)
        .patch(`/tasks/${taskOne._Id}`)
        .send({
            description: true
        })
        .expect(401)
})

test('Should not update other users task', async () => {
    const response = await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            description: 'hello'
        })
        .expect(400)

    expect(taskOne.description).toEqual('First task')
})

test('Should not delete other users tasks', async() => {
    await request(app) 
        .delete(`/tasks/${taskOne._Id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(500)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not delete task if unauthenticated', async() => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)

    expect(response).not.toBeNull()
})

test('Should fetch page of tasks', async () => {
    const response = await request(app)
        .get('/tasks?limit=1&skip=1')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body[0].description).toEqual('Second task')
})

test('Should fetch user task by id', async() => {
    const response = await request(app)
        .get(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(200)

    const task = await Task.findById(response.body._id)
    expect(task.description).toEqual('Third task')
})

test('Should sort tasks by createdAt', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=createdAt:desc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body[0].description).toEqual('Second task')
})

test('Should sort tasks by updatedAt', async() => {
    const response = await request(app)
        .get('/tasks?sortBy=updatedAt:desc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    expect(response.body[0].description).toEqual('Second task')
})

test('Should sort tasks by completed', async () => {
    const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    response.body.forEach(task => expect(task.completed).toEqual(true))
})