import { WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OfflineButtons } from '@/components/offline/OfflineButtons';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full bg-primary-foreground/5 border-primary-foreground/10">
        <CardHeader className="text-center">
          <div className="mx-auto bg-orange-100 rounded-full p-3 w-fit mb-4">
            <WifiOff className="h-12 w-12 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-semibold text-foreground">
            Você está offline
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            Parece que você perdeu a conexão com a internet. Verifique sua conexão e tente novamente.
          </p>
          
          <OfflineButtons />
          
          <div className="pt-4 border-t border-border">
            <h3 className="font-medium mb-2">Enquanto isso, você pode:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Verificar suas páginas visitadas recentemente</li>
              <li>• Navegar pelo conteúdo em cache</li>
              <li>• Aguardar a conexão retornar</li>
            </ul>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Assim que sua conexão for restaurada, você poderá acessar normalmente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 