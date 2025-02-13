import { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Loader,
} from "lucide-react";
import { Carousel } from "react-responsive-carousel";
import { NavLink, useNavigate } from "react-router-dom";
import { useComments } from "../hooks/posts/useComments";
import { useRecoilValue } from "recoil";
import { postStateWithID } from "../store/atoms/posts";
import { toast } from "react-toastify";
import { useLike } from "../hooks/posts/useLikes";
import { useSinglePost } from "../hooks/posts/useSinglepost";
type PostProps = {
  postId: string;
};
const Post = ({ postId }: PostProps) => {
  const post = useRecoilValue(postStateWithID(postId));

  const [showComments, setShowComments] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const { getPost } = useSinglePost(postId!);
  const [comment, setComment] = useState("");
  useEffect(() => {
    (async () => {
      await getPost(postId!);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = async () => {
    if (isLiked) {
      await unLike();
    } else {
      await like();
    }
  };

  // ✅ Hook must be outside event handlers
  const { postComment } = useComments(postId || "");
  const { like, unLike, isLiked } = useLike(postId || "");
  const handleSubmitComment = async () => {
    if (!comment.trim()) return;
    try {
      await postComment(comment);
      toast("Comment posted successfully");
      setComment(""); // Clear input after submission
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-white" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-white text-center py-8">No posts available</div>
    );
  }

  return (
    <div
      key={post.id}
      className="h-fit rounded overflow-hidden border-gray-800 border w-11/12 mx-auto md:min-w-[40rem] lg:w-4/12 md:w-6/12 bg-black sm:mx-3 md:mx-0 lg:mx-0  my-1 flex flex-col"
    >
      {/* Post header */}
      <div className="flex items-center justify-between p-4">
        <div
          onClick={() => {
            navigate(`/${post.author.id}`);
          }}
          className="cursor-pointer flex items-center gap-2"
        >
          <img
            src={
              post.author.displayPictureUrl
                ? `https://instagram-production-90d9.up.railway.app/${post.author.displayPictureUrl}`
                : "/path/to/default/image.jpg"
            }
            alt={post.author.username}
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="font-semibold text-white">
            {post.author.username}
          </span>
        </div>
        <button className="hover:bg-gray-800 p-1 rounded-full">
          <MoreHorizontal className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Post images */}
      <div className="relative">
        {post.imagesUrl?.length > 0 ? (
          <Carousel
            emulateTouch
            showThumbs={false}
            showStatus={false}
            className="w-full"
          >
            {post.imagesUrl.map((url, index) => (
              <div key={index} className="aspect-square">
                <img
                  src={
                    url.startsWith("http")
                      ? url
                      : `https://instagram-production-90d9.up.railway.app/${url}`
                  }
                  alt={`Post content ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="aspect-square bg-gray-800 flex items-center justify-center">
            <p className="text-gray-400">No images available</p>
          </div>
        )}
      </div>

      {/* Post actions */}
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <div className="flex gap-4">
            <button
              onClick={handleClick}
              className={`transition-colors ${
                isLiked ? "text-red-500" : "hover:text-red-500 text-white"
              }`}
            >
              <Heart
                className={`h-6 w-6 ${
                  isLiked ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>

            <button className="hover:text-blue-500 transition-colors">
              <MessageCircle className="h-6 w-6" />
            </button>
            <button className="hover:text-green-500 transition-colors">
              <Share2 className="h-6 w-6" />
            </button>
          </div>
          <button className="hover:text-yellow-500 transition-colors">
            <Bookmark className="h-6 w-6" />
          </button>
        </div>

        {/* Likes */}
        <div className="text-sm font-medium">
          {post._count?.likes > 0
            ? `${post._count.likes?.toLocaleString()} likes`
            : "Be the first to like this"}
        </div>

        {/* Caption */}
        <div className="mt-2 text-sm">
          <span className="font-semibold mr-2">{post.author.username}</span>
          {post.caption}
        </div>

        {/* Comments */}
        {post._count.comments !== 0 &&
          (!showComments ? (
            <div
              onClick={() => {
                setShowComments(!showComments);
              }}
              className="text-sm mb-2 text-gray-400 cursor-pointer font-medium"
            >
              View all {post._count.comments} comments
            </div>
          ) : (
            <Comments postId={post.id} />
          ))}

        {/* ✅ Corrected Comment Input */}
        <div>
          <input
            value={comment}
            onChange={(e) => {
              setComment(e.target.value); // ✅ Set selected post ID
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
            type="text"
            placeholder="Add a comment..."
            className="border-none bg-black outline-none text-white"
          />
        </div>
      </div>
    </div>
  );
};
type CommentsProps = {
  postId: string;
};
function Comments({ postId }: CommentsProps) {
  const { comments } = useComments(postId);

  if (!comments) {
    <span>Loading ...</span>;
  }

  return (
    <>
      {comments.map((comment, i) => (
        <Comment comment={comment} key={i} />
      ))}
    </>
  );
}

type CommentProps = {
  comment: {
    content: string;
    commentedBy: {
      id: string;
      username: string;
      displayPictureUrl: string;
    };
  };
};
function Comment({ comment }: CommentProps) {
  const { content } = comment;

  return (
    <>
      <div className="mb-2">
        <div className="mb-2 text-sm flex items-center">
          <NavLink
            to={`/${comment.commentedBy.id}`}
            className="mr-2 flex items-center gap-2 font-semibold text-sm"
          >
            <span>{comment.commentedBy.username}</span>
          </NavLink>
          <div>{content}</div>
        </div>
      </div>
    </>
  );
}
export default Post;
