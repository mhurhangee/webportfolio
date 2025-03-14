import { DemoButton } from '@/components/demo/components/demo-button';
import { InteractiveCounter } from '@/components/demo/components/interactive-counter';

import { Card } from '@/components/ui/card';

export default function DemoPage() {
  return (
    <div className="container mx-auto py-20 px-4 flex flex-col items-center gap-4">
      <h1 className="text-4xl font-bold mb-8">Demo Component Test</h1>

      <Card className="p-6 max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Button from Demo Package</h2>
        <p className="text-gray-600 mb-6">
          This button is imported from the <code>@/components/demo</code> package, which in turn
          imports the Button component from <code>@workspace/ui</code>.
        </p>

        <div className="flex justify-center mt-2">
          <DemoButton />
        </div>
      </Card>
      <Card className="p-6 max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Interactive Counter from Demo Package</h2>
        <p className="text-gray-600 mb-6">
          This button is imported from the <code>@/components/demo</code> package, which in turn
          imports the Button component from <code>@workspace/ui</code>.
        </p>
        <div className="flex justify-center mt-2">
          <InteractiveCounter />
        </div>
      </Card>
    </div>
  );
}
