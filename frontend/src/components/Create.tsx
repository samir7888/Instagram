import { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Heart, MessageCircle, Loader } from "lucide-react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useCreatePost } from '../hooks/posts/useCreatePost';
import { Carousel } from "react-responsive-carousel";
import { useNavigate, useParams } from "react-router-dom";

export function CreatePost() {
  const { id } = useParams();
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("Caption will look like this");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string[]>([]);
  const navigate = useNavigate();
  const { setPost } = useCreatePost(id || '');

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate('/signin');
    }
  }, [navigate]);

  const handlePostCreation = async () => {
    try {
      if (!files.length) {
        toast.error("Please select at least 1 image");
        return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append("title", "Post Title");
      formData.append("caption", caption);

      files.forEach((file) => {
        formData.append("imagesUrl", file);
      });

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        navigate('/signin');
        return;
      }

      await setPost(formData, token);
      toast.success("Post Created Successfully!");
      // Reset form
      setFiles([]);
      setCaption("Caption will look like this");
      setPreview([]);
      
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreview(newPreviews);
  };

  useEffect(() => {
    return () => {
      preview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [preview]);

  return (
    <main className="flex w-full bg-black text-white">
      <div className="flex w-full gap-5 flex-col-reverse md:flex-row md:justify-around items-center p-10">
        {/* Post Creation Section */}
        <div className="flex md:justify-center bg-gray-950 w-full sm:w-96 flex-col p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Create New Post</h2>

          <label htmlFor="caption" className="font-bold mb-2">
            Caption
          </label>
          <input
            id="caption"
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="bg-gray-900 text-gray-300 text-sm p-3 w-full rounded-md border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-4"
          />

          <label htmlFor="images" className="font-bold mb-2">
            Images
          </label>
          <ImageFileInput onFilesChange={handleFileChange} />

          <button
            onClick={handlePostCreation}
            disabled={loading || !files.length}
            className="bg-blue-500 mt-4 py-2 px-4 rounded-md font-semibold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={18} />
                Uploading...
              </>
            ) : (
              "Upload Post"
            )}
          </button>
        </div>

        {/* Post Preview Section */}
        <div>
          <h1 className="text-center text-2xl mb-4">Post Preview</h1>
          <div className="rounded-lg overflow-hidden border border-gray-800 w-11/12 mx-auto md:min-w-[30rem] lg:w-4/12 md:w-6/12 bg-black sm:mx-3 md:mx-0 lg:mx-0 my-1">
            <div className="w-full flex items-center p-3">
              <div className="rounded-full h-8 w-8 bg-gray-500 flex items-center justify-center overflow-hidden" />
              <span className="pt-1 ml-2 font-bold text-sm">username</span>
            </div>

            {preview.length > 0 ? (
              <Carousel emulateTouch showThumbs={false} className="w-[478px]">
                {preview.map((url, i) => (
                  <div key={i} className="w-full">
                    <img
                      src={url}
                      alt={`Preview ${i + 1}`}
                      className="w-full object-cover"
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="w-full aspect-square bg-gray-800 flex items-center justify-center text-gray-500">
                No image selected
              </div>
            )}

            <div className="px-3 pb-2">
              <div className="pt-2">
                <div className="pt-1 flex gap-2">
                  <button>
                    <Heart className="text-white" />
                  </button>
                  <button>
                    <MessageCircle className="text-white" />
                  </button>
                </div>
                <span className="text-sm text-gray-400 font-medium">
                  0 likes
                </span>
              </div>
              <div className="pt-1">
                <div className="mb-2 text-sm">
                  <span className="font-medium mr-2">username</span>
                  {caption}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

type ImageFileInputProps = {
  onFilesChange(files: File[]): void;
};

const ImageFileInput = ({ onFilesChange }: ImageFileInputProps) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        id="images"
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          const fileList = e.target.files;
          if (fileList) {
            const files = Array.from(fileList);
            onFilesChange(files);
          }
        }}
        className="bg-gray-100 hidden"
      />
      <button
        className="bg-blue-500 my-2 focus:bg-blue-600 hover:bg-blue-600 w-full p-1 rounded-md text-white transition-colors"
        onClick={() => ref.current?.click()}
      >
        Select from computer
      </button>
    </>
  );
};