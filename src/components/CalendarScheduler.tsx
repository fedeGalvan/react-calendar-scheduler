import React, { useState } from "react";

interface Task {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  color?: string;
}

interface CalendarSchedulerProps {
  dayQuantity: number;
  startHour: number;
  endHour: number;
  weekdaysOnly?: boolean;
  tasks?: Task[];
  onTaskClick?: (task: Task) => void;
}

const CalendarScheduler: React.FC<CalendarSchedulerProps> = ({
  dayQuantity = 7,
  startHour = 8,
  endHour = 18,
  weekdaysOnly = false,
  tasks: initialTasks,
  onTaskClick,
}) => {
  const [tasks] = useState<Task[]>(
    initialTasks || [
      {
        id: "1",
        title: "Meeting",
        description: "Team sync meeting",
        start: new Date(new Date().setHours(10, 0, 0, 0)),
        end: new Date(new Date().setHours(11, 30, 0, 0)),
        color: "#6366f1",
      },
      {
        id: "2",
        title: "Lunch",
        description: "Lunch break",
        start: new Date(new Date().setHours(12, 30, 0, 0)),
        end: new Date(new Date().setHours(13, 30, 0, 0)),
        color: "#10b981", 
      },
      {
        id: "3",
        title: "Project Work",
        description: "Frontend development",
        start: new Date(new Date().setHours(14, 0, 0, 0)),
        end: new Date(new Date().setHours(17, 0, 0, 0)),
        color: "#f59e0b", 
      },
      {
        id: "4",
        title: "Code Review",
        description: "Review pull requests",
        start: new Date(new Date().setHours(10, 0, 0, 0)),
        end: new Date(new Date().setHours(11, 30, 0, 0)),
        color: "#ef4444", 
      },
      {
        id: "5",
        title: "Client Meeting",
        description: "Project status update",
        start: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(14, 0, 0, 0)),
        end: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(15, 30, 0, 0)),
        color: "#8b5cf6", 
      },
      {
        id: "6",
        title: "Design Review",
        description: "UI/UX feedback session",
        start: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(11, 0, 0, 0)),
        end: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(12, 30, 0, 0)),
        color: "#ec4899", 
      },
      {
        id: "7",
        title: "Team Building",
        description: "Virtual team activity",
        start: new Date(new Date().setHours(12, 0, 0, 0)),
        end: new Date(new Date().setHours(13, 30, 0, 0)),
        color: "#0ea5e9", 
      }
    ]
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  const timeSlots = Array.from(
    { length: (endHour - startHour) * 2 },
    (_, i) => startHour + i / 2
  );
  
  const days = (() => {
    const result = [];
    let currentDate = new Date();
    
    if (weekdaysOnly) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 0) { 
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (dayOfWeek === 6) { 
        currentDate.setDate(currentDate.getDate() + 2);
      }
    }
    
    for (let i = 0; i < 31; i++) { 
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      
      if (weekdaysOnly) {
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { 
          continue;
        }
      }
      
      result.push(date);
      
      if (result.length >= dayQuantity) {
        break;
      }
    }
    
    return result;
  })();

  const getTasksForDay = (day: Date) => {
    return tasks.filter(
      (task) => task.start.toDateString() === day.toDateString()
    );
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    const dayName = date.toLocaleDateString("es-ES", { weekday: "short" });
    const dayNumber = date.getDate();
    const month = date.toLocaleDateString("es-ES", { month: "short" });
    
    let label = isToday ? "Hoy" : isTomorrow ? "Mañana" : dayName;
    
    return { dayName: label, dayNumber, month, isToday };
  };

  const formatTime = (timeSlot: number) => {
    const hours = Math.floor(timeSlot);
    const minutes = Math.round((timeSlot % 1) * 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const arrangeOverlappingTasks = (tasksForDay: Task[]) => {
    const sortedTasks = [...tasksForDay].sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    );
    
    const blocks: Task[][] = [];
    
    sortedTasks.forEach((task) => {
      const blockIndex = blocks.findIndex((block) =>
        block.some(
          (existingTask) =>
            task.start < existingTask.end && task.end > existingTask.start
        )
      );
      
      if (blockIndex === -1) {
        blocks.push([task]);
      } else {
        blocks[blockIndex].push(task);
      }
    });
    
    return blocks.map((block) => {
      const columns: Task[][] = [];
      
      block.forEach((task) => {
        const columnIndex = columns.findIndex((column) =>
          column.every(
            (existingTask) =>
              task.end <= existingTask.start || task.start >= existingTask.end
          )
        );
        
        if (columnIndex === -1) {
          columns.push([task]);
        } else {
          columns[columnIndex].push(task);
        }
      });
      
      return columns;
    });
  };

  const getTaskPosition = (
    task: Task,
    column: number,
    totalColumns: number
  ) => {
    const taskStart = task.start.getHours() + task.start.getMinutes() / 60;
    const taskEnd = task.end.getHours() + task.end.getMinutes() / 60;

    if (taskEnd <= startHour || taskStart >= endHour) {
      return { hidden: true };
    }

    const adjustedStart = Math.max(taskStart, startHour);
    const adjustedEnd = Math.min(taskEnd, endHour);

    const totalHours = endHour - startHour;
    const top = ((adjustedStart - startHour) / totalHours) * 100;
    const height = ((adjustedEnd - adjustedStart) / totalHours) * 100;

    if (totalColumns === 1) {
      return {
        top: `${top}%`,
        height: `${height}%`,
        width: `calc(100% - 8px)`,
        left: `4px`,
      };
    }

    const width = 100 / totalColumns - 2; 
    const left = column * (100 / totalColumns) + 1; 

    return {
      top: `${top}%`,
      height: `${height}%`,
      width: `${width}%`,
      left: `${left}%`,
    };
  };


  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  const isCurrentTimeSlot = (timeSlot: number) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeValue = currentHour + currentMinute / 60;
    
    return Math.abs(currentTimeValue - timeSlot) < 0.25;
  };

  // Obtener la posición de la línea de tiempo actual
  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeValue = currentHour + currentMinute / 60;
    
    if (currentTimeValue < startHour || currentTimeValue > endHour) {
      return null;
    }
    
    return ((currentTimeValue - startHour) / (endHour - startHour)) * 100;
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className="relative bg-white">
      <div className="flex border-b">
        <div className="w-16 flex-shrink-0"></div>
        {days.map((day, index) => {
          const { dayName, dayNumber, month, isToday } = formatDate(day);
          return (
            <div
              key={index}
              className={`flex-1 text-center py-2 border-l ${
                isToday ? "bg-blue-50" : ""
              }`}
            >
              <div className={`font-medium ${isToday ? "text-blue-600" : "text-gray-600"}`}>
                {dayName}
              </div>
              <div className={`text-xs ${isToday ? "text-blue-600" : "text-gray-500"}`}>
                {dayNumber} {month}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex relative">
        <div className="w-16 flex-shrink-0 bg-gray-50 z-10">
          {timeSlots.map((timeSlot, index) => (
            <div
              key={index}
              className={`h-8 text-xs text-right pr-2 flex items-center justify-end ${
                isCurrentTimeSlot(timeSlot) ? "font-medium text-blue-600" : "text-gray-500"
              }`}
            >
              {formatTime(timeSlot)}
            </div>
          ))}
        </div>

        <div className="flex-grow relative">
          <div className="absolute inset-0">
            {timeSlots.map((_, index) => (
              <div
                key={index}
                className="h-8 border-t border-gray-200"
              ></div>
            ))}
          </div>

          {currentTimePosition !== null && (
            <div
              className="absolute left-0 right-0 border-t-2 border-red-500 z-20"
              style={{
                top: `${currentTimePosition}%`,
              }}
            >
              <div className="absolute -top-1.5 -left-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          )}

          <div className="flex h-full absolute inset-0">
            {days.map((day, dayIndex) => {
              const tasksForDay = getTasksForDay(day);
              const arrangedBlocks = arrangeOverlappingTasks(tasksForDay);
              const isToday = day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={dayIndex}
                  className={`flex-1 border-l relative ${isToday ? "bg-blue-50/30" : ""}`}
                  style={{ height: `${timeSlots.length * 32}px` }}
                >
                  {arrangedBlocks.map((block) =>
                    block.map((column, columnIndex) =>
                      column.map((task) => {
                        const taskStyle = getTaskPosition(
                          task,
                          columnIndex,
                          block.length
                        );
                        const isSelected = selectedTask?.id === task.id;
                        const isHovered = hoveredTask === task.id;

                        if (taskStyle.hidden) return null;

                        return (
                          <div
                            key={task.id}
                            className={`absolute p-1.5 overflow-hidden rounded text-white shadow transition-all cursor-pointer ${
                              isSelected || isHovered ? "z-30 shadow-lg" : "z-20"
                            }`}
                            style={{
                              top: taskStyle.top,
                              height: taskStyle.height,
                              width: taskStyle.width,
                              left: taskStyle.left,
                              backgroundColor: task.color || "#4f46e5",
                              transform: (isSelected || isHovered) ? "scale(1.02)" : "scale(1)",
                            }}
                            onClick={() => handleTaskClick(task)}
                            onMouseEnter={() => setHoveredTask(task.id)}
                            onMouseLeave={() => setHoveredTask(null)}
                          >
                            <div className="flex flex-col h-full">
                              <div className="font-medium text-xs leading-tight">
                                {task.title}
                              </div>
                              {parseFloat(taskStyle.height as string) > 8 && (
                                <div className="text-xs opacity-90 mt-0.5">
                                  {formatTime(task.start.getHours() + task.start.getMinutes() / 60)} - 
                                  {formatTime(task.end.getHours() + task.end.getMinutes() / 60)}
                                </div>
                              )}
                              {parseFloat(taskStyle.height as string) > 15 && task.description && (
                                <div className="text-xs opacity-80 mt-1 line-clamp-2">
                                  {task.description}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarScheduler;