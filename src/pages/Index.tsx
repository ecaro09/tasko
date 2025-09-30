import { MadeWithDyad } from "@/components/made-with-dyad";
import EnhancedCreateTaskForm from "@/components/tasks/EnhancedCreateTaskForm";
import RealTimeTaskList from "@/components/tasks/RealTimeTaskList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Welcome to Tasko!</h1>
      <p className="text-lg text-muted-foreground">Your go-to platform for getting tasks done.</p>

      <Card>
        <CardHeader>
          <CardTitle>Post a New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedCreateTaskForm />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Available Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <RealTimeTaskList filter="all" limit={6} />
        </CardContent>
      </Card>
      
      <MadeWithDyad />
    </div>
  );
};

export default Index;