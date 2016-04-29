<?php
namespace Home\Controller;
use Think\Controller;
class IndexController extends Controller {
    public function index(){
        $this->show();
    }
    public function index1(){
        $this->show();
    }
    public function post(){
        $name = $_POST['ajax-name'];
        $file = $_POST['filename'];

        $upload = new \Think\Upload();// 实例化上传类
        $upload->maxSize   =     314572800 ;// 设置附件上传大小
//      $upload->exts      =     array('jpg', 'gif', 'png', 'jpeg');// 设置附件上传类型
        $upload->rootPath  =     './Uploads/'; // 设置附件上传根目录
        $upload->savePath  =     ''; // 设置附件上传（子）目录

        $info   =   $upload->uploadOne($_FILES['photo1']);
        dump($info);
        if(!$info) {
            $statues['statue'] = 0;
            $statues['message'] = $upload->getError();
        }else{
            $statues['statue'] = 1;
            $statues['message'] =  '/Uploads/'.$info['savepath'].$info['savename'];
            //将附件插入数据库
            $attachData = array(
                'add_time'=>time(),
                'file_location'=>$info['savepath'].$info['savename'],
                'comment_id'=>0,
                'wait_approval'=>0
            );
            $statues['id'] = $attachData;
        }
        echo json_encode($statues);

        //$this->ajaxReturn($aa);
    }
}