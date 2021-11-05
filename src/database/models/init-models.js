var DataTypes = require("sequelize").DataTypes;
var _applications = require("./applications");
var _comments = require("./comments");
var _files = require("./files");
var _follows = require("./follows");
var _likes = require("./likes");
var _possessions = require("./possessions");
var _post_attachments = require("./post_attachments");
var _posts = require("./posts");
var _projects = require("./projects");
var _projects_has_tags = require("./projects_has_tags");
var _recruitment_attachments = require("./recruitment_attachments");
var _recruitments = require("./recruitments");
var _tags = require("./tags");
var _tags_has_recruitments = require("./tags_has_recruitments");
var _users = require("./users");

function initModels(sequelize) {
  var applications = _applications(sequelize, DataTypes);
  var comments = _comments(sequelize, DataTypes);
  var files = _files(sequelize, DataTypes);
  var follows = _follows(sequelize, DataTypes);
  var likes = _likes(sequelize, DataTypes);
  var possessions = _possessions(sequelize, DataTypes);
  var post_attachments = _post_attachments(sequelize, DataTypes);
  var posts = _posts(sequelize, DataTypes);
  var projects = _projects(sequelize, DataTypes);
  var projects_has_tags = _projects_has_tags(sequelize, DataTypes);
  var recruitment_attachments = _recruitment_attachments(sequelize, DataTypes);
  var recruitments = _recruitments(sequelize, DataTypes);
  var tags = _tags(sequelize, DataTypes);
  var tags_has_recruitments = _tags_has_recruitments(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  post_attachments.belongsTo(files, { as: "file", foreignKey: "file_id"});
  files.hasMany(post_attachments, { as: "post_attachments", foreignKey: "file_id"});
  recruitment_attachments.belongsTo(files, { as: "file", foreignKey: "file_id"});
  files.hasMany(recruitment_attachments, { as: "recruitment_attachments", foreignKey: "file_id"});
  post_attachments.belongsTo(posts, { as: "post", foreignKey: "post_id"});
  posts.hasMany(post_attachments, { as: "post_attachments", foreignKey: "post_id"});
  comments.belongsTo(projects, { as: "project", foreignKey: "project_id"});
  projects.hasMany(comments, { as: "comments", foreignKey: "project_id"});
  likes.belongsTo(projects, { as: "project", foreignKey: "project_id"});
  projects.hasMany(likes, { as: "likes", foreignKey: "project_id"});
  possessions.belongsTo(projects, { as: "project", foreignKey: "project_id"});
  projects.hasMany(possessions, { as: "possessions", foreignKey: "project_id"});
  posts.belongsTo(projects, { as: "project", foreignKey: "project_id"});
  projects.hasMany(posts, { as: "posts", foreignKey: "project_id"});
  projects_has_tags.belongsTo(projects, { as: "project", foreignKey: "project_id"});
  projects.hasMany(projects_has_tags, { as: "projects_has_tags", foreignKey: "project_id"});
  applications.belongsTo(recruitments, { as: "recruitment", foreignKey: "recruitment_id"});
  recruitments.hasMany(applications, { as: "applications", foreignKey: "recruitment_id"});
  recruitment_attachments.belongsTo(recruitments, { as: "recruitment", foreignKey: "recruitment_id"});
  recruitments.hasMany(recruitment_attachments, { as: "recruitment_attachments", foreignKey: "recruitment_id"});
  tags_has_recruitments.belongsTo(recruitments, { as: "recruitment", foreignKey: "recruitment_id"});
  recruitments.hasMany(tags_has_recruitments, { as: "tags_has_recruitments", foreignKey: "recruitment_id"});
  projects_has_tags.belongsTo(tags, { as: "tag", foreignKey: "tag_id"});
  tags.hasMany(projects_has_tags, { as: "projects_has_tags", foreignKey: "tag_id"});
  tags_has_recruitments.belongsTo(tags, { as: "tag", foreignKey: "tag_id"});
  tags.hasMany(tags_has_recruitments, { as: "tags_has_recruitments", foreignKey: "tag_id"});
  applications.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(applications, { as: "applications", foreignKey: "user_id"});
  follows.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(follows, { as: "follows", foreignKey: "user_id"});
  follows.belongsTo(users, { as: "target", foreignKey: "target_id"});
  users.hasMany(follows, { as: "target_follows", foreignKey: "target_id"});
  likes.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(likes, { as: "likes", foreignKey: "user_id"});
  possessions.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(possessions, { as: "possessions", foreignKey: "user_id"});
  posts.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(posts, { as: "posts", foreignKey: "user_id"});
  recruitments.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(recruitments, { as: "recruitments", foreignKey: "user_id"});

  return {
    applications,
    comments,
    files,
    follows,
    likes,
    possessions,
    post_attachments,
    posts,
    projects,
    projects_has_tags,
    recruitment_attachments,
    recruitments,
    tags,
    tags_has_recruitments,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
