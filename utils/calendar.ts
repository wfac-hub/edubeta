
import { Course, WeekSchedule, Holiday, Classroom, CourseClass } from '../types';

const dayNameToNumber: { [key: string]: number } = {
  'Domingo': 0,
  'Lunes': 1,
  'Martes': 2,
  'Miércoles': 3,
  'Jueves': 4,
  'Viernes': 5,
  'Sábado': 6,
};

const isHoliday = (currentDate: Date, holidays: Holiday[], courseLocation: string | undefined): boolean => {
  // Use UTC methods to avoid timezone issues. currentDate is already a UTC date from the generator.
  const year = currentDate.getUTCFullYear();
  const month = currentDate.getUTCMonth() + 1; // JS months are 0-indexed
  const day = currentDate.getUTCDate();

  for (const holiday of holidays) {
    if (holiday.location && holiday.location !== courseLocation) {
        continue;
    }

    const { type } = holiday.date;
    if (type === 'specific') {
      if (Number(holiday.date.day) === day && Number(holiday.date.month) === month && Number(holiday.date.year) === year) {
        return true;
      }
    } else if (type === 'recurring') {
      if (Number(holiday.date.day) === day && Number(holiday.date.month) === month) {
        return true;
      }
    } else if (type === 'range' && holiday.date.startDate && holiday.date.endDate) {
        // Parse holiday range dates as UTC to ensure correct comparison
        const startParts = holiday.date.startDate.split('-').map(Number);
        const endParts = holiday.date.endDate.split('-').map(Number);
        
        const startDate = new Date(Date.UTC(startParts[0], startParts[1] - 1, startParts[2]));
        const endDate = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2]));
        
        // currentDate is already UTC midnight, so a direct comparison is accurate
        if (currentDate >= startDate && currentDate <= endDate) {
          return true;
        }
    }
  }
  return false;
};

export const generateCourseClasses = (
    course: Course,
    allSchedules: WeekSchedule[],
    allHolidays: Holiday[],
    allClassrooms: Classroom[]
): CourseClass[] => {
    if (!course.startDate || !course.endDate || !course.scheduleIds || course.scheduleIds.length === 0) {
        return [];
    }

    const courseSchedules = allSchedules.filter(s => course.scheduleIds.includes(s.id));
    if(courseSchedules.length === 0) return [];
    
    const courseScheduleMap = new Map<number, WeekSchedule>();
    courseSchedules.forEach(s => {
        const dayNum = dayNameToNumber[s.day];
        if (dayNum !== undefined) {
            courseScheduleMap.set(dayNum, s);
        }
    });
    
    const courseClassroom = allClassrooms.find(c => c.id === course.classroomId);
    const courseLocation = courseClassroom?.location;

    const classes: CourseClass[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date for comparison

    const startParts = course.startDate.split('-').map(Number);
    const endParts = course.endDate.split('-').map(Number);
    const startDate = new Date(Date.UTC(startParts[0], startParts[1] - 1, startParts[2]));
    const endDate = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2]));
    
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getUTCDay();
        if (courseScheduleMap.has(dayOfWeek)) {
            if (!isHoliday(currentDate, allHolidays, courseLocation)) {
                const schedule = courseScheduleMap.get(dayOfWeek)!;
                const classDate = new Date(currentDate);
                classes.push({
                    id: `${course.id}-${classDate.toISOString().split('T')[0]}`,
                    courseId: course.id,
                    date: classDate,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    teacherId: course.teacherId,
                    isSubstitution: false,
                    status: classDate < today ? 'Hecha' : 'Pendiente',
                    internalComment: '',
                    publicComment: '',
                });
            }
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    
    return classes;
};


export const calculateClassesCount = (
    course: Course,
    allSchedules: WeekSchedule[],
    allHolidays: Holiday[],
    allClassrooms: Classroom[]
): number => {
    if (!course.startDate || !course.endDate || !course.scheduleIds || course.scheduleIds.length === 0) {
        return course.classesCount || 0;
    }
    
    return generateCourseClasses(course, allSchedules, allHolidays, allClassrooms).length;
};