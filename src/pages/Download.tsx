
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Download = () => {
  const { token } = useParams();
  const [downloadLink, setDownloadLink] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Invalid download link");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('download_links')
          .select(`
            *,
            orders (
              user_email,
              product_name,
              amount,
              created_at
            )
          `)
          .eq('download_token', token)
          .eq('is_active', true)
          .single();

        if (error || !data) {
          setError("Download link not found or has expired");
          return;
        }

        // Check if expired
        const expiryDate = new Date(data.expires_at);
        if (expiryDate < new Date()) {
          setError("This download link has expired");
          return;
        }

        // Check download limit
        if (data.download_count >= data.max_downloads) {
          setError("Download limit reached for this link");
          return;
        }

        setDownloadLink(data);
      } catch (err) {
        console.error("Token validation error:", err);
        setError("Failed to validate download link");
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleDownload = async () => {
    if (!downloadLink || !token) return;

    setIsDownloading(true);
    try {
      // Use secure download edge function
      const { data, error } = await supabase.functions.invoke('get-product-download', {
        body: {
          downloadToken: token
        }
      });

      if (error || !data.success) {
        console.error("Download error:", error);
        alert(data?.error || "Download failed. Please try again or contact support.");
        return;
      }

      // Redirect to the signed URL for download
      window.open(data.downloadUrl, '_blank');
      
      // Update local state to reflect the new download count
      setDownloadLink(prev => ({
        ...prev,
        download_count: prev.download_count + 1
      }));
      
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed. Please try again or contact support.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-xl">Validating download link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-white flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            ⚠️
          </div>
          <h1 className="text-4xl font-bold mb-4">Download Error</h1>
          <p className="text-xl text-gray-300 mb-8">{error}</p>
          <Button asChild className="bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] px-8 py-3 rounded-full font-bold">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-gradient-to-r from-[#ffd700] to-[#ffed4e] rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          📥
        </div>
        
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-[#ffd700] bg-clip-text text-transparent">
          Download Ready
        </h1>
        
        <div className="bg-gradient-to-r from-[#2d2d2d] to-[#1a1a1a] p-8 rounded-2xl border border-[rgba(255,215,0,0.2)] mb-8">
          <h2 className="text-2xl font-bold text-[#ffd700] mb-4">Order Details</h2>
          <div className="text-left space-y-2">
            <p><strong>Product:</strong> {downloadLink?.orders?.product_name}</p>
            <p><strong>Email:</strong> {downloadLink?.orders?.user_email}</p>
            <p><strong>Purchase Date:</strong> {new Date(downloadLink?.orders?.created_at).toLocaleDateString()}</p>
            <p><strong>Downloads Used:</strong> {downloadLink?.download_count} / {downloadLink?.max_downloads}</p>
            <p><strong>Expires:</strong> {new Date(downloadLink?.expires_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg disabled:opacity-50"
          >
            {isDownloading ? "Processing..." : "📥 Download Collection"}
          </Button>
          
          <div className="text-sm text-gray-400">
            <p>⚠️ This link expires on {new Date(downloadLink?.expires_at).toLocaleDateString()}</p>
            <p>Need help? Contact support@luxevisionshop.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Download;
