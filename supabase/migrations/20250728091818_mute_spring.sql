/*
  # Create courses and lessons tables

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, not null)
      - `instructor_id` (uuid, foreign key to users)
      - `thumbnail_url` (text, optional)
      - `created_at` (timestamp with time zone, default now())
      - `updated_at` (timestamp with time zone, default now())

    - `lessons`
      - `id` (uuid, primary key)
      - `course_id` (uuid, foreign key to courses)
      - `title` (text, not null)
      - `content` (text, not null)
      - `order` (integer, not null)
      - `type` (text, not null) - 'article' or 'quiz'
      - `created_at` (timestamp with time zone, default now())

  2. Security
    - Enable RLS on both tables
    - Add policies for reading courses/lessons
    - Add policies for instructors to manage their content
*/

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  instructor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  "order" integer NOT NULL,
  type text NOT NULL DEFAULT 'article' CHECK (type IN ('article', 'quiz')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Policies for courses
CREATE POLICY "Courses are viewable by everyone"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Instructors can insert their own courses"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update their own courses"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can delete their own courses"
  ON courses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = instructor_id);

-- Policies for lessons
CREATE POLICY "Lessons are viewable by everyone"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Instructors can manage lessons for their courses"
  ON lessons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lessons.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

-- Trigger for courses updated_at
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON courses 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, "order");