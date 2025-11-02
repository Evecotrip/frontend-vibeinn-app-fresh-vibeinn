import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useThemes } from '../../hooks/use-themes';
import { Post } from '../../mock/feed/feedData';

interface SinglePostCardProps {
  post: Post;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COMMENTS_SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;

// Internal component that assumes post is always valid
const SinglePostCardInternal: React.FC<{ post: Post }> = ({ post }) => {
  const { theme, isDark } = useThemes();
  const [isLiked, setIsLiked] = useState(() => Boolean(post.isLiked));
  const [isMuted, setIsMuted] = useState(true);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Create video player instance
  const videoPlayer = useVideoPlayer(post.videoUrl ? { uri: post.videoUrl } : null, (player) => {
    player.muted = isMuted;
  });
  
  const commentsSheetY = useMemo(() => new Animated.Value(COMMENTS_SHEET_HEIGHT), []);

  // Mock comments data - memoized to prevent recreation
  const mockComments = useMemo(() => [
    {
      id: '1',
      username: 'johndoe',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      comment: 'Amazing post! Love the energy ⚡️',
      timestamp: '2h',
      likes: 12,
    },
    {
      id: '2',
      username: 'jane_smith',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      comment: 'This is so inspiring! Thanks for sharing 🙌',
      timestamp: '4h',
      likes: 8,
    },
    {
      id: '3',
      username: 'alex_wilson',
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
      comment: 'Can\'t wait to try this myself!',
      timestamp: '6h',
      likes: 5,
    },
  ], []);

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
  }, [isLiked]);

  const toggleVideoPlayback = useCallback(async () => {
    if (!videoPlayer) return;
    
    try {
      if (videoPlayer.playing) {
        videoPlayer.pause();
      } else {
        videoPlayer.play();
      }
    } catch (error) {
      console.log('Error toggling video playback:', error);
    }
  }, [videoPlayer]);

  const toggleMute = useCallback(async () => {
    if (!videoPlayer) return;
    
    try {
      videoPlayer.muted = !isMuted;
      setIsMuted(!isMuted);
    } catch (error) {
      console.log('Error toggling mute:', error);
    }
  }, [videoPlayer, isMuted]);

  const showComments = useCallback(() => {
    setCommentsVisible(true);
    Animated.spring(commentsSheetY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [commentsSheetY]);

  const hideComments = useCallback(() => {
    Animated.spring(commentsSheetY, {
      toValue: COMMENTS_SHEET_HEIGHT,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setCommentsVisible(false);
    });
  }, [commentsSheetY]);

  const sendComment = useCallback(() => {
    if (commentText.trim()) {
      // Here you would send the comment to your backend
      console.log('Sending comment:', commentText);
      setCommentText('');
    }
  }, [commentText]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Full Screen Post */}
      <ScrollView 
        style={styles.postContainer} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <View style={styles.userInfo}>
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              style={styles.avatarGradient}
            >
              <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
            </LinearGradient>
            <View style={styles.userTextContainer}>
              <Text style={[styles.username, { color: theme.text }]}>
                {post.username}
              </Text>
              <View style={styles.universityRow}>
                <Ionicons name="school-outline" size={12} color={theme.placeholder} />
                <Text style={[styles.university, { color: theme.placeholder }]}>
                  {post.university}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Media - Full Screen */}
        {post.media && post.media.length > 0 && (
          <View style={styles.mediaContainer}>
            {post.videoUrl ? (
              <View style={styles.videoWrapper}>
                <VideoView
                  style={styles.video}
                  player={videoPlayer}
                  allowsFullscreen={false}
                  allowsPictureInPicture={false}
                  contentFit="cover"
                />
                <TouchableOpacity style={styles.videoOverlay} onPress={toggleVideoPlayback}>
                  {!videoPlayer?.playing && (
                    <BlurView intensity={30} style={styles.playButtonBlur}>
                      <View style={styles.playButton}>
                        <Ionicons name="play" size={32} color="white" />
                      </View>
                    </BlurView>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
                  <BlurView intensity={30} style={styles.muteButtonBlur}>
                    <Ionicons
                      name={isMuted ? "volume-mute" : "volume-high"}
                      size={20}
                      color="white"
                    />
                  </BlurView>
                </TouchableOpacity>
              </View>
            ) : (
              <Image
                source={{ uri: post.media[0] }}
                style={styles.media}
                resizeMode="cover"
              />
            )}
          </View>
        )}

        {/* Actions */}
        <View style={[styles.actions, { backgroundColor: theme.background }]}>
          <View style={styles.leftActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={28}
                color={isLiked ? theme.energetic : theme.text}
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={showComments}>
              <Ionicons name="chatbubble-outline" size={26} color={theme.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={26} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name={post.isSaved ? "bookmark" : "bookmark-outline"}
              size={26}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>

        {/* Likes Count */}
        <View style={styles.likesContainer}>
          <Text style={[styles.likesText, { color: theme.text }]}>
            {post.likes} likes
          </Text>
        </View>

        {/* Caption */}
        <View style={styles.captionContainer}>
          <Text style={[styles.captionUsername, { color: theme.text }]}>
            {post.username}{' '}
          </Text>
          <Text style={[styles.captionText, { color: theme.text }]}>
            {post.content}
          </Text>
        </View>

        {/* View Comments */}
        <TouchableOpacity style={styles.viewCommentsButton} onPress={showComments}>
          <Text style={[styles.viewCommentsText, { color: theme.placeholder }]}>
            View all {post.comments} comments
          </Text>
        </TouchableOpacity>

        {/* Timestamp */}
        <View style={styles.timestampContainer}>
          <Text style={[styles.timestamp, { color: theme.placeholder }]}>
            {post.timestamp}
          </Text>
        </View>
      </ScrollView>

      {/* Comments Bottom Sheet */}
      {commentsVisible && (
        <Animated.View
          style={[
            styles.commentsSheet,
            {
              backgroundColor: theme.background,
              transform: [{ translateY: commentsSheetY }],
            },
          ]}
        >
          {/* Sheet Handle */}
          <View style={styles.sheetHandle}>
            <View style={[styles.handle, { backgroundColor: theme.placeholder }]} />
          </View>

          {/* Comments Header */}
          <View style={[styles.commentsHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.commentsTitle, { color: theme.text }]}>Comments</Text>
            <TouchableOpacity onPress={hideComments}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
            {mockComments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
                <View style={styles.commentContent}>
                  <View style={styles.commentTextContainer}>
                    <Text style={[styles.commentUsername, { color: theme.text }]}>
                      {comment.username}
                    </Text>
                    <Text style={[styles.commentText, { color: theme.text }]}>
                      {comment.comment}
                    </Text>
                  </View>
                  <View style={styles.commentMeta}>
                    <Text style={[styles.commentTimestamp, { color: theme.placeholder }]}>
                      {comment.timestamp}
                    </Text>
                    <Text style={[styles.commentLikes, { color: theme.placeholder }]}>
                      {comment.likes} likes
                    </Text>
                    <TouchableOpacity>
                      <Text style={[styles.replyButton, { color: theme.placeholder }]}>
                        Reply
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity style={styles.commentLikeButton}>
                  <Ionicons name="heart-outline" size={16} color={theme.placeholder} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Comment Input */}
          <View style={[styles.commentInputContainer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
            <Image source={{ uri: post.userAvatar }} style={styles.inputAvatar} />
            <TextInput
              style={[styles.commentInput, { color: theme.text, backgroundColor: theme.inputBackground }]}
              placeholder="Add a comment..."
              placeholderTextColor={theme.placeholder}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, { opacity: commentText.trim() ? 1 : 0.5 }]} 
              onPress={sendComment}
              disabled={!commentText.trim()}
            >
              <Text style={[styles.sendButtonText, { color: theme.primary }]}>Post</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'white',
  },
  userTextContainer: {
    marginLeft: 12,
  },
  username: {
    fontWeight: '700',
    fontSize: 14,
  },
  universityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  university: {
    fontSize: 12,
    marginLeft: 4,
  },
  moreButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    position: 'relative',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonBlur: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 10,
  },
  muteButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
    padding: 4,
  },
  likesContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  likesText: {
    fontWeight: '600',
    fontSize: 14,
  },
  captionContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  captionUsername: {
    fontWeight: '600',
    fontSize: 14,
  },
  captionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  viewCommentsButton: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  viewCommentsText: {
    fontSize: 14,
  },
  timestampContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  timestamp: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  commentsSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: COMMENTS_SHEET_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 16,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  commentUsername: {
    fontWeight: '600',
    fontSize: 13,
    marginRight: 8,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  commentMeta: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
  },
  commentTimestamp: {
    fontSize: 12,
    marginRight: 16,
  },
  commentLikes: {
    fontSize: 12,
    marginRight: 16,
  },
  replyButton: {
    fontSize: 12,
    fontWeight: '600',
  },
  commentLikeButton: {
    padding: 4,
    marginLeft: 8,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 12,
    paddingHorizontal: 4,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

// Wrapper component that handles post validation
const SinglePostCard: React.FC<SinglePostCardProps> = ({ post }) => {
  const { theme } = useThemes();
  
  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.text }]}>
            Post not found
          </Text>
        </View>
      </View>
    );
  }
  
  return <SinglePostCardInternal post={post} />;
};

export default React.memo(SinglePostCard);