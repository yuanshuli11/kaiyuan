#!/bin/bash
# 设置mysql的登录用户名和密码(根据实际情况填写)
mysql_user="root"
mysql_password="Shuli123666~"
mysql_host="127.0.0.1"
mysql_port="2333"
mysql_charset="utf8mb4"
mysql_database=$1

# 备份文件存放地址(根据实际情况填写)
backup_location=/work/sql_backup

# 是否删除过期数据
expire_backup_delete="ON"
expire_days=7
backup_time=`date +%Y%m%d%H%M`
backup_dir=$backup_location
welcome_msg="Welcome to use MySQL backup tools!"

# 判断mysql实例是否正常运行
mysql_ps=`ps -ef |grep mysql |wc -l`
mysql_listen=`netstat -an |grep LISTEN |grep $mysql_port|wc -l`
if [ [$mysql_ps == 0] -o [$mysql_listen == 0] ]; then
        echo "ERROR:MySQL is not running! backup stop!"
        exit
else
        echo $welcome_msg
fi

rm -rf $backup_dir/*
tarGzName=$backup_dir/$mysql_database-$backup_time.sql
# 备份指定数据库中数据(此处假设数据库是mysql_backup_test)
mysqldump -h$mysql_host -P$mysql_port -u$mysql_user -p$mysql_password -B $mysql_database > $tarGzName --column-statistics=0
flag=`echo $?`
if [ $flag == "0" ];then
        echo "database mysql_backup_test success backup to $backup_dir/mysql_backup_test-$backup_time.sql.gz"
else
        echo "database mysql_backup_test backup fail!"
fi

coscli cp $tarGzName cos://sqlback/$mysql_database-$backup_time.sql
# 删除过期数据
if [ "$expire_backup_delete" == "ON" -a  "$backup_location" != "" ];then
        `find $backup_location/ -type f -mtime +$expire_days | xargs rm -rf`
        echo "Expired backup data delete complete!"
fi