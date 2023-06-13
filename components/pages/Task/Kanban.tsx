import { useAuthStore } from "@/utils/zustand/authStore/useAuthStore";
import { useRealmStore } from "@/utils/zustand/realm/useRealmStore";
import { ETaskStatuses } from "@/utils/zustand/taskStore/ITaskStore";
import {
  getTasks,
  hanldeDragDrop,
  useTasksStore,
} from "@/utils/zustand/taskStore/useTaskStore";
import React, { useEffect } from "react";
import { BsCircleHalf } from "react-icons/bs";
import { FaCheckCircle } from "react-icons/fa";
import * as TbIcons from "react-icons/tb";
import TaskCard from "./TaskCard";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "react-beautiful-dnd";

const boards = [
  {
    heading: "Todo",
    enum: ETaskStatuses["todo"],
    icon: (
      <TbIcons.TbCircleDotted className="w-[22px] h-[22px] fill-[#adb5bd]" />
    ),
  },
  {
    heading: "In-Progess",
    enum: ETaskStatuses["in-progress"],
    icon: <BsCircleHalf className="w-[19px] h-[19px] fill-primary" />,
  },
  {
    heading: "Completed",
    enum: ETaskStatuses["completed"],
    icon: <FaCheckCircle className="w-[19px] h-[19px] fill-lime-500" />,
  },
];

const Kanban = () => {
  const taskStore = useTasksStore((s) => s);
  const { tasks, setTasks } = taskStore;

  return (
    <div className="w-full h-full grow gap-10 overflow-hidden flex justify-between">
      <DragDropContext
        onDragEnd={(res) => hanldeDragDrop({ result: res, taskStore })}
      >
        {boards.map((board) => (
          <TasksColumn key={board.enum} {...board} />
        ))}
      </DragDropContext>
    </div>
  );
};

export default Kanban;

const TasksColumn: React.FC<{
  heading: string;
  enum: ETaskStatuses;
  icon: React.JSX.Element;
}> = (props) => {
  const { user } = useAuthStore((s) => s);

  const { tasks } = useTasksStore((s) => s);

  return (
    <Droppable droppableId={props.enum}>
      {(droppableProvided, droppableSnapshot) => (
        <div
          className="w-full h-full relative shadow-shadow-form-input rounded-2xl overflow-auto pb-3"
          ref={droppableProvided.innerRef}
          {...droppableProvided.droppableProps}
        >
          <div className="w-full shadow-shadow-primary-sm mb-6 sticky top-0 left-0 px-8 py-3 flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <span className="text-lg">{props.heading}</span>
              {props.icon}
            </div>
            <span className="bg-bg-primary-light px-3 rounded-xl">
              {tasks && tasks[props.enum].totalLength}
            </span>
          </div>
          <div className="flex flex-col gap-4 px-6">
            {tasks &&
              tasks[props.enum].tasks?.map((e, i) => (
                <TaskCard task={e} key={e.$id} index={i} />
              ))}
          </div>
          {droppableProvided.placeholder}
        </div>
      )}
    </Droppable>
  );
};
