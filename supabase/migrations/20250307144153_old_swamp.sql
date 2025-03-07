/*
  # Initial Schema Setup

  1. New Tables
    - `semesters`
      - `id` (uuid, primary key)
      - `name` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)

    - `courses`
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text)
      - `description` (text)
      - `instructor` (text)
      - `semester_id` (uuid, references semesters)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)

    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `course_id` (uuid, references courses)
      - `task_type` (text)
      - `due_date` (date)
      - `status` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)

  2. Views
    - `tasks_with_courses`: Combines task data with course information

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create semesters table
CREATE TABLE IF NOT EXISTS semesters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  description text,
  instructor text,
  semester_id uuid REFERENCES semesters(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  task_type text NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'not-started',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_status CHECK (status IN ('not-started', 'in-progress', 'completed')),
  CONSTRAINT valid_task_type CHECK (task_type IN ('assignment', 'reading', 'test', 'quiz', 'project', 'other'))
);

-- Create view for tasks with course information
CREATE OR REPLACE VIEW tasks_with_courses AS
SELECT 
  t.id,
  t.title,
  t.description,
  t.task_type,
  t.due_date,
  t.status,
  t.user_id,
  c.name as course_name,
  c.code as course_code
FROM tasks t
JOIN courses c ON t.course_id = c.id;

-- Enable Row Level Security
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policies for semesters
CREATE POLICY "Users can manage their own semesters"
  ON semesters
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for courses
CREATE POLICY "Users can manage their own courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for tasks
CREATE POLICY "Users can manage their own tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_semesters_user_id ON semesters(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_semester_id ON courses(semester_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_course_id ON tasks(course_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);