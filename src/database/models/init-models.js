var DataTypes = require("sequelize").DataTypes;
var _applications = require("./applications");
var _chats = require("./chats");
var _comments = require("./comments");
var _files = require("./files");
var _follows = require("./follows");
var _likes = require("./likes");
var _notifications = require("./notifications");
var _possessions = require("./possessions");
var _posts = require("./posts");
var _posts_attachments = require("./posts_attachments");
var _projects = require("./projects");
var _projects_tags = require("./projects_tags");
var _recruitments = require("./recruitments");
var _recruitments_attachments = require("./recruitments_attachments");
var _recruitments_tags = require("./recruitments_tags");
var _users = require("./users");

function initModels(sequelize) {
  var applications = _applications(sequelize, DataTypes);
  var chats = _chats(sequelize, DataTypes);
  var comments = _comments(sequelize, DataTypes);
  var files = _files(sequelize, DataTypes);
  var follows = _follows(sequelize, DataTypes);
  var likes = _likes(sequelize, DataTypes);
  var notifications = _notifications(sequelize, DataTypes);
  var possessions = _possessions(sequelize, DataTypes);
  var posts = _posts(sequelize, DataTypes);
  var posts_attachments = _posts_attachments(sequelize, DataTypes);
  var projects = _projects(sequelize, DataTypes);
  var projects_tags = _projects_tags(sequelize, DataTypes);
  var recruitments = _recruitments(sequelize, DataTypes);
  var recruitments_attachments = _recruitments_attachments(sequelize, DataTypes);
  var recruitments_tags = _recruitments_tags(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  posts_attachments.belongsTo(files, { as: "file", foreignKey: "file_id"});
  files.hasMany(posts_attachments, { as: "posts_attachments", foreignKey: "file_id"});
  recruitments_attachments.belongsTo(files, { as: "file", foreignKey: "file_id"});
  files.hasMany(recruitments_attachments, { as: "recruitments_attachments", foreignKey: "file_id"});
  posts_attachments.belongsTo(posts, { as: "post", foreignKey: "post_id"});
  posts.hasMany(posts_attachments, { as: "posts_attachments", foreignKey: "post_id"});
  comments.belongsTo(projects, { as: "project", foreignKey: "project_id"});
  projects.hasMany(comments, { as: "comments", foreignKey: "project_id"});
  likes.belongsTo(projects, { as: "project", foreignKey: "project_id"});
  projects.hasMany(likes, { as: "likes", foreignKey: "project_id"});
  possessions.belongsTo(projects, { as: "project", foreignKey: "project_id"});
  projects.hasMany(possessions, { as: "possessions", foreignKey: "project_id"});
  posts.belongsTo(projects, { as: "project", foreignKey: "project_id"});
  projects.hasMany(posts, { as: "posts", foreignKey: "project_id"});
  projects_tags.belongsTo(projects, { as: "project", foreignKey: "project_id"});
  projects.hasMany(projects_tags, { as: "projects_tags", foreignKey: "project_id"});
  applications.belongsTo(recruitments, { as: "recruitment", foreignKey: "recruitment_id"});
  recruitments.hasMany(applications, { as: "applications", foreignKey: "recruitment_id"});
  recruitments_attachments.belongsTo(recruitments, { as: "recruitment", foreignKey: "recruitment_id"});
  recruitments.hasMany(recruitments_attachments, { as: "recruitments_attachments", foreignKey: "recruitment_id"});
  recruitments_tags.belongsTo(recruitments, { as: "recruitment", foreignKey: "recruitment_id"});
  recruitments.hasMany(recruitments_tags, { as: "recruitments_tags", foreignKey: "recruitment_id"});
  applications.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(applications, { as: "applications", foreignKey: "user_id"});
  chats.belongsTo(users, { as: "sender_user", foreignKey: "sender"});
  users.hasMany(chats, { as: "chats", foreignKey: "sender"});
  chats.belongsTo(users, { as: "receiver_user", foreignKey: "receiver"});
  users.hasMany(chats, { as: "receiver_chats", foreignKey: "receiver"});
  comments.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(comments, { as: "comments", foreignKey: "user_id"});
  follows.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(follows, { as: "follows", foreignKey: "user_id"});
  follows.belongsTo(users, { as: "target", foreignKey: "target_id"});
  users.hasMany(follows, { as: "target_follows", foreignKey: "target_id"});
  likes.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(likes, { as: "likes", foreignKey: "user_id"});
  notifications.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(notifications, { as: "notifications", foreignKey: "user_id"});
  possessions.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(possessions, { as: "possessions", foreignKey: "user_id"});
  posts.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(posts, { as: "posts", foreignKey: "user_id"});
  recruitments.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(recruitments, { as: "recruitments", foreignKey: "user_id"});

  return {
    applications,
    chats,
    comments,
    files,
    follows,
    likes,
    notifications,
    possessions,
    posts,
    posts_attachments,
    projects,
    projects_tags,
    recruitments,
    recruitments_attachments,
    recruitments_tags,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
