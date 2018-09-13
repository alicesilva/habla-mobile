import * as React from 'react';
import { FlatList, View, StyleSheet, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { api } from '../../services/api';
import { TextInput } from 'react-native-gesture-handler';
import moment from 'moment';
import PostComponent from '../../components/post/post';

export default class TimelineScreen extends React.Component<TimelineProps, TimelineState> {
  static navigationOptions = (navigation) => {
    let params = navigation.navigation.state.params;

    return {
      title: params && params.channel? `#${params.channel.title}`: 'Timeline', 
      headerStyle: {
        backgroundColor: 'white',
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        color: '#161616'
      }
    }
  };

  constructor(props: TimelineProps) {
    super(props);

    this.state = { 
      posts: [], 
      post: {}, 
      refreshing: false, 
      editable: false, 
      posting: false 
    };
  }

  resetPost() {
    this.setState({
      post: {
        channelId: this.props.navigation.state.params && this.props.navigation.state.params.channel? this.props.navigation.state.params.channel.id: null
      }
    });
  }

  componentWillMount() {
    this.refresh();
    this.resetPost();
  }

  refresh = async() => {
    this.setState({ refreshing: true });
    
    try {
      await this.fetchPosts();
    } catch (error) {
      console.log(error);
    }
      
    this.setState({ refreshing: false });
  }

  fetchPosts = async() => {
    try {
      let posts = await api.get('posts', { params: { channelId: this.props.navigation.state.params && this.props.navigation.state.params.channel? this.props.navigation.state.params.channel.id: null }});

      this.setState({ posts: posts.data });

    } catch (error) {
     console.log(error);
    }
  }

  sendPost = async() => {
    this.setState({ posting: true });

    try {
      await api.post('posts', this.state.post);
      await this.fetchPosts();

    } catch (error) {
      console.log(error);
    } 

    this.resetPost();
    this.setState({ posting: false });
  }

  handlePostInput = (text: string) => {
    this.setState({ post: { ...this.state.post, body: text }});
  }

  openChannel = (channel) => {
    if (this.props.navigation.state.params && this.props.navigation.state.params.channel) return;
    
    this.props.navigation.push('TimelineScreen', { channel: channel });
  }

  openProfile = (profile) => {
    this.props.navigation.push('ProfileScreen', { profile: profile });
  }

  openPost = (post) => {
    this.props.navigation.push('PostScreen', { post: post });
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.page.container}
                  refreshControl={
                    <RefreshControl
                      refreshing={this.state.refreshing}
                      onRefresh={this.refresh}
                    />
                  }>
        <View style={styles.newPost.container}>
          <TextInput style={styles.newPost.input}
                     onChangeText={this.handlePostInput}
                     value={this.state.post.body}
                     placeholderTextColor="black"
                     placeholder="What's up?"
                     editable={!this.state.posting}
                     underlineColorAndroid="rgba(0,0,0,0)"/>
          {(this.state.post.body && this.state.post.body.trim() !== '')? <TouchableOpacity style={styles.newPost.sendButton}
                            onPress={this.sendPost}
                            disabled={this.state.posting}
                            activeOpacity={1}>
            {this.state.posting? <ActivityIndicator color="white"/>: <Text style={styles.newPost.sendButtonText}>Send</Text>}
          </TouchableOpacity>: null}
        </View>
        <FlatList data={this.state.posts}
                  bounces={false}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({item}) =>(
                  <TouchableOpacity onPress={() => this.openPost(item)}>
                    <PostComponent post={item}
                                   showPostHeader={true}
                                   onOpenProfile={this.openProfile}
                                   onOpenChannel={this.openChannel}/>
                  </TouchableOpacity>
        )}/>
      </ScrollView>
    );
  }
}

const styles = {
  page: StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#eee'
    }
  }),
  newPost: StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: 'white',
      marginVertical: 2,
    },
    input: {
      padding: 16,
      backgroundColor: 'white',
      color: 'black',
      flex: 1,
      fontSize: 18
    },
    sendButton: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#4dabf5',
      padding: 8,
      width: 50,
      height: 35,
      borderRadius: 100,
      margin: 5
    },
    sendButtonText: {
      color: 'white',
      fontWeight: 'bold',
    }
  })
};

interface TimelineState {
    posts: any[];
    post: any;
    refreshing: boolean;
    editable: boolean;
    posting: boolean;
}

interface TimelineProps {
  navigation: any;
}