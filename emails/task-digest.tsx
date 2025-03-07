import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
} from "@react-email/components";
import { format } from "date-fns";
import { TaskEmailData } from "@/lib/email-renderer";

interface TaskDigestEmailProps {
  tasks: TaskEmailData[];
  tasksByCourse: Record<string, TaskEmailData[]>;
  daysWindow: number;
}

export default function TaskDigestEmail({
  tasks,
  tasksByCourse,
  daysWindow,
}: TaskDigestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        You have {String(tasks.length)} tasks due in the next {String(daysWindow)} days
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Upcoming Tasks</Heading>
          <Text style={text}>
            Here are your tasks due in the next {daysWindow} days
          </Text>

          {Object.entries(tasksByCourse).map(([course, courseTasks]) => (
            <Section key={course} style={courseSection}>
              <Heading as="h2" style={h2}>
                {course}
              </Heading>
              {courseTasks.map((task) => (
                <Section key={task.id} style={taskSection}>
                  <Text style={taskTitle}>{task.title}</Text>
                  <Text style={taskDue}>
                    Due: {format(new Date(task.dueDate), "MMMM d, yyyy")}
                  </Text>
                  {task.description && (
                    <Text style={taskDescription}>{task.description}</Text>
                  )}
                </Section>
              ))}
            </Section>
          ))}

          <Text style={footer}>
            This is an automated message from your{" "}
            <Link href="https://syllabusmanager.com">Syllabus Manager</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const h2 = {
  color: "#2563eb",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "20px 0 10px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "center" as const,
};

const courseSection = {
  margin: "30px 0",
};

const taskSection = {
  padding: "10px 20px",
  marginBottom: "15px",
  backgroundColor: "#f8fafc",
  borderRadius: "6px",
};

const taskTitle = {
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 8px",
};

const taskDue = {
  fontSize: "14px",
  color: "#666",
  margin: "0 0 8px",
};

const taskDescription = {
  fontSize: "14px",
  color: "#444",
  margin: "0",
};

const footer = {
  color: "#666",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "48px 0 0",
};