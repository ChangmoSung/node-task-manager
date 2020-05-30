require('../src/db/mongoose')
const Task = require('../src/models/task')

// Task.findByIdAndDelete('5ed20fddf9324909c683a4f5').then(task => {
//     console.log(task)

//     return Task.countDocuments({completed: false})
// }).then(result => {
//     console.log(result)
// }).catch(e => console.log(e))


const deleteTaskAndCount = async (id) => {
    await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({ completed: false })

    return count
}

deleteTaskAndCount('5ed22bbb7d59f50f73ad65d3').then(count => {
    console.log(count)
}).catch(e => console.log(e))