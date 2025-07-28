/*
  # Insert sample data for demonstration

  1. Sample Data
    - Create sample instructors and learners
    - Create sample courses with lessons
    - Create sample quizzes
    - Create sample enrollments and progress

  Note: This is for demonstration purposes only
*/

-- Insert sample users (instructors and learners)
INSERT INTO users (id, email, full_name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@example.com', 'Admin User', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'instructor1@example.com', 'Dr. Sarah Johnson', 'instructor'),
  ('33333333-3333-3333-3333-333333333333', 'instructor2@example.com', 'Prof. Michael Chen', 'instructor'),
  ('44444444-4444-4444-4444-444444444444', 'learner1@example.com', 'Alice Smith', 'learner'),
  ('55555555-5555-5555-5555-555555555555', 'learner2@example.com', 'Bob Wilson', 'learner')
ON CONFLICT (email) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (id, title, description, instructor_id) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
    'Introduction to Web Development',
    'Learn the fundamentals of web development including HTML, CSS, and JavaScript. Perfect for beginners who want to start their journey in web development.',
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Advanced React.js Concepts', 
    'Deep dive into advanced React concepts including hooks, context, performance optimization, and testing. Ideal for developers with React experience.',
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Database Design and SQL',
    'Master database design principles and SQL querying. Learn to design efficient databases and write complex queries.',
    '33333333-3333-3333-3333-333333333333'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample lessons for Web Development course
INSERT INTO lessons (id, course_id, title, content, "order", type) VALUES
  (
    'lesson01-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Getting Started with HTML',
    '# Getting Started with HTML

HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page using elements.

## Basic HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Web Page</title>
</head>
<body>
    <h1>Welcome to Web Development</h1>
    <p>This is your first HTML page!</p>
</body>
</html>
```

## Common HTML Elements

- `<h1>` to `<h6>` - Headings
- `<p>` - Paragraphs  
- `<div>` - Generic container
- `<span>` - Inline container
- `<a>` - Links
- `<img>` - Images
- `<ul>`, `<ol>`, `<li>` - Lists

Practice creating HTML documents with these elements to build your foundation.',
    1,
    'article'
  ),
  (
    'lesson02-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'HTML Fundamentals Quiz',
    'Test your knowledge of HTML fundamentals',
    2,
    'quiz'
  ),
  (
    'lesson03-aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Introduction to CSS',
    '# Introduction to CSS

CSS (Cascading Style Sheets) is used to style and layout web pages. It controls how HTML elements are displayed.

## CSS Syntax

```css
selector {
    property: value;
    property: value;
}
```

## Common CSS Properties

- `color` - Text color
- `background-color` - Background color
- `font-size` - Size of text
- `margin` - Space outside element
- `padding` - Space inside element
- `border` - Element border
- `width`, `height` - Element dimensions

## CSS Selectors

- Element selector: `p { color: blue; }`
- Class selector: `.my-class { color: red; }`
- ID selector: `#my-id { color: green; }`

Practice styling HTML elements to create visually appealing web pages.',
    3,
    'article'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample quiz for HTML lesson
INSERT INTO quizzes (id, lesson_id, questions, passing_score) VALUES
  (
    'quiz01-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'lesson02-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '[
      {
        "id": "q1",
        "question": "What does HTML stand for?",
        "options": [
          "Hyper Text Markup Language",
          "High Tech Modern Language", 
          "Home Tool Markup Language",
          "Hyperlink and Text Markup Language"
        ],
        "correct_answer": 0,
        "points": 25
      },
      {
        "id": "q2", 
        "question": "Which HTML element is used for the largest heading?",
        "options": ["<h6>", "<h1>", "<header>", "<heading>"],
        "correct_answer": 1,
        "points": 25
      },
      {
        "id": "q3",
        "question": "What is the correct HTML element for inserting a line break?",
        "options": ["<break>", "<lb>", "<br>", "<newline>"],
        "correct_answer": 2,
        "points": 25
      },
      {
        "id": "q4",
        "question": "Which attribute specifies the URL of a link?",
        "options": ["src", "link", "href", "url"],
        "correct_answer": 2,
        "points": 25
      }
    ]'::jsonb,
    70
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample lessons for React course
INSERT INTO lessons (id, course_id, title, content, "order", type) VALUES
  (
    'lesson01-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Advanced React Hooks',
    '# Advanced React Hooks

React Hooks allow you to use state and other React features in functional components.

## useState Hook

```javascript
import React, { useState } from ''react'';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

## useEffect Hook

```javascript
import React, { useState, useEffect } from ''react'';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

## Custom Hooks

Custom Hooks let you extract component logic into reusable functions.',
    1,
    'article'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample enrollments
INSERT INTO enrollments (user_id, course_id) VALUES
  ('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('55555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc')
ON CONFLICT (user_id, course_id) DO NOTHING;

-- Insert sample progress
INSERT INTO user_progress (user_id, course_id, lesson_id, completed, score, completed_at) VALUES
  (
    '44444444-4444-4444-4444-444444444444', 
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'lesson01-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    true,
    null,
    now() - interval '2 days'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
    'lesson02-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    true,
    85,
    now() - interval '1 day'
  )
ON CONFLICT (user_id, lesson_id) DO NOTHING;