import { TaskModel, TaskSchema } from '../models/taskModel';
import { Service } from 'typedi';


@Service()
export class TaskRepository {

    async save(task: TaskModel): Promise<TaskModel> {

        const newTask = new TaskSchema(task);
        return newTask.save();
    }

    async update(task: TaskModel): Promise<TaskModel | null> {
        return TaskSchema.findOneAndUpdate({ _id: task._id }, task, { new: true }).exec();
    }

    async updateById(_id: string, updateData: Partial<TaskModel>): Promise<TaskModel | null> {
        return TaskSchema.findOneAndUpdate({ _id }, updateData, { new: true }).exec();
    }

    async findById(taskId: string): Promise<TaskModel | null> {
        return TaskSchema.findById(taskId).exec();
    }

    async deleteById(taskId: string): Promise<void> {
        await TaskSchema.findByIdAndDelete(taskId).exec();
    }

    async findAll(query?: any): Promise<TaskModel[]> {
        return TaskSchema.find(query).exec();
    }

    async countTotalTasks(): Promise<number> {
        return TaskSchema.countDocuments().exec();
    }

    async findTasksByDateRange(startDate: Date, endDate: Date): Promise<TaskModel[]> {
        return TaskSchema.find({
            startDate: { $gte: startDate },
            endDate: { $lte: endDate }
        }).exec();
    }
}
