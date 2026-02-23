import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ApiKeyInputProps {
  providerId: string;
  value?: string;
  onChange?: (value: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ providerId, value, onChange }) => {
  const getApiKeyLink = () => {
    switch (providerId) {
      case 'zai':
        return 'https://www.bigmodel.cn/claude-code?ic=14BY54APZA';
      case 'anthropic':
        return 'https://www.aliyun.com/benefit/ai/aistar?userCode=vmx5szbq&clubBiz=subTask..12384055..10263..';
      case 'custom':
        return '#'; // 默认链接
      default:
        return '#';
    }
  };

  const getLinkText = () => {
    switch (providerId) {
      case 'zai':
        return 'Get API Token';
      case 'anthropic':
        return 'Get API Key';
      case 'custom':
        return 'Get API Key';
      default:
        return 'Get API Key';
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="apiKey">API Key</Label>
      <div className="flex space-x-2">
        <Input
          id="apiKey"
          type="password"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Enter your API key"
        />
        <Button
          variant="outline"
          onClick={() => window.open(getApiKeyLink(), '_blank', 'noopener,noreferrer')}
        >
          {getLinkText()}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Get your API key from{' '}
        <a
          href={getApiKeyLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          here
        </a>
      </p>
    </div>
  );
};

export { ApiKeyInput };