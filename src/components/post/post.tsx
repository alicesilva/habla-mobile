import * as React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, Dimensions } from 'react-native';
import moment from 'moment';
import { FontAwesome } from '@expo/vector-icons';
import { client } from '../../services/client';
import gql from 'graphql-tag';
import i18n from 'i18n-js';
import { getTranslatedDistanceFromEnum } from '../../util';
import AutoHeightImage from 'react-native-auto-height-image';

export default class PostComponent extends React.Component<PostComponentProps, PostComponentState> {
  constructor(props: PostComponentProps) {
    super(props);

    this.state = { 
      post: this.props.post
    };
  }

  componentWillReceiveProps() {
    this.setState({ post: this.props.post });
  }

  vote = async(type: "UP" | "DOWN") => {
    if (!(type === "UP" || type === "DOWN")) return;

    this.setState({ post: { ... this.state.post }});

    try {
      const response = await client.mutate({
        variables: { 
          postId: this.state.post.id,
          type: type
        },
        mutation: gql(`
          mutation VotePost ($postId: ID!, $type: PostVoteType!) {
            vote(postId: $postId, type: $type) {
              type
              post {
                id
              }
              profile {
                uid
                photoURL
              }
              post {
                rate
              }
            }
          }
        `)
      });

      this.setState({
        post: {
          ... this.state.post, 
          rate: response.data.vote.post.rate,
          profilePostVote: response.data.vote
        }
      });
    } catch (error) {
      // handle
    }
  }

  render() {
      const vote = this.state.post.profilePostVote && this.state.post.profilePostVote.type;

      return (
      <View style={styles.container}>
      { this.props.showPostHeader? 
        (<View style={styles.header}>
          <TouchableOpacity style={styles.avatar} disabled={ !this.state.post.owner } onPress={() => this.props.onOpenProfile && this.props.onOpenProfile(this.state.post.owner)}>
            { this.state.post.owner && this.state.post.owner.photoURL?  
            <Image style={styles.avatarIconImage as any} source={{ uri: this.state.post.owner.photoURL }}/>:
            <FontAwesome style={styles.avatarIcon} name="user-circle"/>}
            {this.state.post.owner?
              <Text style={styles.headerText}>{ this.state.post.owner.username }</Text>
            : <Text style={styles.headerText}>{ i18n.t('global.user.anonymousLabel') }</Text>}
          </TouchableOpacity>

          <Text style={styles.headerText}>{getTranslatedDistanceFromEnum(this.state.post.distance)}</Text>
        </View>)
      : null }
        <View style={styles.postBody}>
          <View style={styles.postLeft}>
            <View style={styles.middle}>
              <Text style={styles.bodyText}>{ this.state.post.body }</Text>
              <Image source={{ uri: this.state.post.photoURL}}/>
            </View>
          </View>
          <View style={styles.postRight}>
            <TouchableOpacity disabled={vote === "UP"} onPress={() => this.vote("UP")}>
              <FontAwesome style={styles.voteButton} name="chevron-up" color={vote === "UP"? "#777": null}/>
            </TouchableOpacity>
            <Text style={styles.postRate}>
              { this.state.post.rate || 0 }
            </Text>
            <TouchableOpacity disabled={vote === "DOWN"} onPress={() => this.vote("DOWN")}>
              <FontAwesome style={styles.voteButton} name="chevron-down" color={vote === "DOWN"? "#777": null}/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottom}>
          <Text style={styles.bottomText}>{ moment(this.state.post.createdAt).fromNow() }</Text>
          {this.state.post.channel? 
          (<View style={styles.footerItem}>
            <Text style={styles.separator}>
              •
            </Text>
            <TouchableOpacity onPress={() => this.props.onOpenChannel && this.props.onOpenChannel(this.state.post.channel)}>
              <Text style={styles.channelTitle}>#{ this.state.post.channel.name }</Text>
            </TouchableOpacity>
          </View>): (null)}
          <Text style={styles.separator}>
            •
          </Text>
          <View style={styles.footerItem}>
            <FontAwesome style={styles.footerItemIcon} name="comments"/>
            <Text style={styles.bottomText}>
              { this.state.post.commentsCount }
            </Text>
          </View>
        </View>
        <View>
          {this.state.post.photoURL?  
          <AutoHeightImage width={Dimensions.get('window').width} source={{ uri: this.state.post.photoURL }} style={styles.postPhoto} />
        :null}
        </View>
      </View>)
  }
}

const styles = StyleSheet.create({
  postBody: {
    flexDirection: 'row',
  },
  postPhoto: {
    width: '100%',
  },
  container: { 
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 2,
    borderBottomColor: '#F5F5F5',
    borderBottomWidth: 2
  }, 
  header: {
    flexDirection: 'row',
    marginBottom: 2,
    justifyContent: 'space-between',
    alignItems: "center"
  },
  bottom: {
    flexDirection: 'row',
    marginTop: 2,
    alignItems: "center"
  },
  avatar: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarIcon: {
    fontSize: 30,
    marginRight: 8
  },
  avatarIconImage: {
    marginRight: 8,
    width: 40,
    height: 40,
    borderRadius: 20
  },
  headerText: {
    fontSize: 12, 
    fontWeight: 'bold'
  },
  channelTitle: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  bodyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181818',
    marginVertical: 8
  },
  middle: {
    flexDirection: 'row'
  },
  postLeft: {
    width: '90%'
  },
  postRight: {
    flexGrow: 1,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  voteButton: {
    fontSize: 25
  },
  postRate: {
    fontSize: 18
  },
  bottomText: {
    fontSize: 10
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerItemIcon: {
    fontSize: 20,
    marginRight: 3
  },
  separator: {
    marginHorizontal: 5
  }
});

export interface PostComponentProps {
  post: any;
  showPostHeader: boolean;
  onOpenProfile?: (profile) => void;
  onOpenChannel?: (channel) => void;
}

export interface PostComponentState {
  post: any;
}