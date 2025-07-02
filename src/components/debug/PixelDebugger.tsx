import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trackPurchase, trackInitiateCheckout, trackViewContent } from '@/utils/metaPixel';

export const PixelDebugger = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [trackedPurchases, setTrackedPurchases] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<any[]>([]);

  useEffect(() => {
    // Load tracked purchases from localStorage
    const stored = JSON.parse(localStorage.getItem('tracked_purchases') || '[]');
    setTrackedPurchases(stored);

    // Load debug info
    const debug = JSON.parse(localStorage.getItem('pixel_debug_log') || '[]');
    setDebugInfo(debug.slice(-10)); // Last 10 events
  }, []);

  const testPurchaseEvent = () => {
    const testId = `test-${Date.now()}`;
    console.log('🧪 Testing purchase event with ID:', testId);
    
    const success = trackPurchase(19.99, 'USD', 'Test Purchase Event', testId);
    
    if (success) {
      console.log('✅ Test purchase event fired successfully');
      alert('✅ Test purchase event fired successfully!');
      
      // Update local state
      const updated = [...trackedPurchases, testId];
      setTrackedPurchases(updated);
    } else {
      console.log('❌ Test purchase event failed');
      alert('❌ Test purchase event failed - check console for details');
    }
    
    // Refresh debug info
    setTimeout(() => {
      const debug = JSON.parse(localStorage.getItem('pixel_debug_log') || '[]');
      setDebugInfo(debug.slice(-10));
      const purchases = JSON.parse(localStorage.getItem('tracked_purchases') || '[]');
      setTrackedPurchases(purchases);
    }, 500);
  };

  const clearTracking = () => {
    localStorage.removeItem('tracked_purchases');
    localStorage.removeItem('pixel_debug_log');
    setTrackedPurchases([]);
    setDebugInfo([]);
    console.log('Cleared all tracking data');
  };

  const checkPixelStatus = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      console.log('✅ Meta Pixel is loaded and available');
      alert('✅ Meta Pixel is loaded and available');
    } else {
      console.log('❌ Meta Pixel is NOT loaded');
      alert('❌ Meta Pixel is NOT loaded');
    }
  };

  // Only show in development or when manually enabled
  if (!isVisible && process.env.NODE_ENV === 'production') {
    return (
      <Button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white z-50"
        size="sm"
      >
        🐛 Debug
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto bg-white border-2 border-purple-500 z-50 shadow-xl">
      <CardHeader className="bg-purple-600 text-white">
        <CardTitle className="flex justify-between items-center text-sm">
          Meta Pixel Debugger
          <Button 
            onClick={() => setIsVisible(false)}
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-purple-700"
          >
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={testPurchaseEvent} size="sm" className="bg-green-600 hover:bg-green-700">
            🧪 Test Purchase
          </Button>
          <Button onClick={checkPixelStatus} size="sm" className="bg-blue-600 hover:bg-blue-700">
            📊 Check Pixel
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => {
              const sessionId = new URLSearchParams(window.location.search).get('session_id');
              if (sessionId) {
                trackPurchase(19.99, 'USD', 'Real Session Test', sessionId);
                alert(`🔄 Tracked purchase for real session: ${sessionId}`);
              } else {
                alert('❌ No session_id found in URL');
              }
            }} 
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700"
          >
            🔄 Test Real Session
          </Button>
          <Button 
            onClick={() => {
              // Force track multiple test purchases
              for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                  trackPurchase(19.99, 'USD', `Bulk Test ${i+1}`, `bulk-${Date.now()}-${i}`);
                }, i * 1000);
              }
              alert('🚀 Fired 3 test purchases (1s intervals)');
            }} 
            size="sm" 
            className="bg-orange-600 hover:bg-orange-700"
          >
            🚀 Bulk Test
          </Button>
        </div>
        
        <Button onClick={clearTracking} size="sm" className="w-full bg-red-600 hover:bg-red-700">
          Clear Tracking Data
        </Button>

        <div className="text-xs">
          <p className="font-semibold text-purple-700">Tracked Purchases ({trackedPurchases.length}):</p>
          <div className="max-h-20 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
            {trackedPurchases.length === 0 ? (
              <p className="text-gray-500">No purchases tracked yet</p>
            ) : (
              trackedPurchases.map((id, idx) => (
                <div key={idx} className="truncate">{id}</div>
              ))
            )}
          </div>
        </div>

        <div className="text-xs">
          <p className="font-semibold text-purple-700">Recent Events:</p>
          <div className="max-h-24 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
            {debugInfo.length === 0 ? (
              <p className="text-gray-500">No events logged yet</p>
            ) : (
              debugInfo.map((event, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-1 mb-1">
                  <div className="font-mono text-xs text-green-600">{event.event}</div>
                  <div className="text-xs text-gray-600">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};