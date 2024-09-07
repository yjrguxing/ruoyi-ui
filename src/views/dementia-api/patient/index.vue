<template>
  <div class="app-container" v-loading="pageLoading">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="氏名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="氏名を入力してください"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
<!--      <el-form-item label="年齢" prop="age">-->
<!--        <el-input-->
<!--          v-model="queryParams.age"-->
<!--          placeholder="年齢を入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="誕生日" prop="birthday">-->
<!--        <el-date-picker clearable-->
<!--          v-model="queryParams.birthday"-->
<!--          type="date"-->
<!--          value-format="YYYY-MM-DD"-->
<!--          placeholder="誕生日を選んでください">-->
<!--        </el-date-picker>-->
<!--      </el-form-item>-->
<!--      <el-form-item label="診断日" prop="examday">-->
<!--        <el-date-picker clearable-->
<!--          v-model="queryParams.examday"-->
<!--          type="date"-->
<!--          value-format="YYYY-MM-DD"-->
<!--          placeholder="診断日を選んでください">-->
<!--        </el-date-picker>-->
<!--      </el-form-item>-->
<!--      <el-form-item label="性別;0-男 1-女" prop="sex">-->
<!--        <el-select v-model="queryParams.sex" placeholder="性別;0-男 1-女を選んでください" clearable>-->
<!--          <el-option-->
<!--            v-for="dict in sys_user_sex"-->
<!--            :key="dict.value"-->
<!--            :label="dict.label"-->
<!--            :value="dict.value"-->
<!--          />-->
<!--        </el-select>-->
<!--      </el-form-item>-->
<!--      <el-form-item label="身長" prop="height">-->
<!--        <el-input-->
<!--          v-model="queryParams.height"-->
<!--          placeholder="身長を入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="体重" prop="weight">-->
<!--        <el-input-->
<!--          v-model="queryParams.weight"-->
<!--          placeholder="体重を入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="BMI" prop="bmi">-->
<!--        <el-input-->
<!--          v-model="queryParams.bmi"-->
<!--          placeholder="BMIを入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="拡張期血圧" prop="dp">-->
<!--        <el-input-->
<!--          v-model="queryParams.dp"-->
<!--          placeholder="拡張期血圧を入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="収縮期血圧" prop="sp">-->
<!--        <el-input-->
<!--          v-model="queryParams.sp"-->
<!--          placeholder="収縮期血圧を入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="赤血球数" prop="rbc">-->
<!--        <el-input-->
<!--          v-model="queryParams.rbc"-->
<!--          placeholder="赤血球数を入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="ヘマトクリット" prop="ht">-->
<!--        <el-input-->
<!--          v-model="queryParams.ht"-->
<!--          placeholder="赤血球比容積を入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="ヘモグロビン" prop="hb">-->
<!--        <el-input-->
<!--          v-model="queryParams.hb"-->
<!--          placeholder="ヘモグロビンを入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="アスパラギン酸アミノトランスフェラーゼ" prop="ast">-->
<!--        <el-input-->
<!--          v-model="queryParams.ast"-->
<!--          placeholder="アスパラギン酸アミノトランスフェラーゼを入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="アラニンアミノトランスフェラーゼ" prop="alt">-->
<!--        <el-input-->
<!--          v-model="queryParams.alt"-->
<!--          placeholder="アラニンアミノトランスフェラーゼを入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="R-GT" prop="rGt">-->
<!--        <el-input-->
<!--          v-model="queryParams.rGt"-->
<!--          placeholder="R-GTを入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="トリグリセリド" prop="tg">-->
<!--        <el-input-->
<!--          v-model="queryParams.tg"-->
<!--          placeholder="トリグリセリドを入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="HDLコレステロール" prop="hdlCho">-->
<!--        <el-input-->
<!--          v-model="queryParams.hdlCho"-->
<!--          placeholder="HDLコレステロールを入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="LDLコレステロール" prop="ldlCho">-->
<!--        <el-input-->
<!--          v-model="queryParams.ldlCho"-->
<!--          placeholder="LDLコレステロールを入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="グルコース" prop="glu">-->
<!--        <el-input-->
<!--          v-model="queryParams.glu"-->
<!--          placeholder="グルコースを入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="HbA1c" prop="hba1c">-->
<!--        <el-input-->
<!--          v-model="queryParams.hba1c"-->
<!--          placeholder="HbA1cを入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="クレアチニン" prop="cr">-->
<!--        <el-input-->
<!--          v-model="queryParams.cr"-->
<!--          placeholder="クレアチニンを入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="尿酸" prop="ua">-->
<!--        <el-input-->
<!--          v-model="queryParams.ua"-->
<!--          placeholder="尿酸を入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="電話番号" prop="phone">-->
<!--        <el-input-->
<!--          v-model="queryParams.phone"-->
<!--          placeholder="電話番号を入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
      <el-form-item label="リスク群" prop="score">
        <el-input
          v-model="queryParams.score"
          placeholder="リスク群を入力してください"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="isAdmin" label="施設名" prop="deptName" style="margin-right: 70px;">
        <el-input
            v-model="queryParams.deptName"
            placeholder="施設名を入力してください"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="isAdmin" label="アップロード者" prop="doctorName" style="white-space: nowrap">
        <el-input
          v-model="queryParams.doctorName"
          placeholder="アップロード者/番号を入力してください"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
<!--      <el-form-item label="作成日時" prop="createdTime">-->
<!--        <el-date-picker clearable-->
<!--          v-model="queryParams.createdTime"-->
<!--          type="date"-->
<!--          value-format="YYYY-MM-DD"-->
<!--          placeholder="新規日時を選んでください">-->
<!--        </el-date-picker>-->
<!--      </el-form-item>-->
<!--      <el-form-item label="更新者" prop="updatedUser">-->
<!--        <el-input-->
<!--          v-model="queryParams.updatedUser"-->
<!--          placeholder="更新者を入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="更新日時" prop="updatedTime">-->
<!--        <el-date-picker clearable-->
<!--          v-model="queryParams.updatedTime"-->
<!--          type="date"-->
<!--          value-format="YYYY-MM-DD"-->
<!--          placeholder="更新日時を選んでください">-->
<!--        </el-date-picker>-->
<!--      </el-form-item>-->
<!--      <el-form-item label="削除者" prop="deletedUser">-->
<!--        <el-input-->
<!--          v-model="queryParams.deletedUser"-->
<!--          placeholder="削除者を入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="削除日時" prop="deletedTime">-->
<!--        <el-date-picker clearable-->
<!--          v-model="queryParams.deletedTime"-->
<!--          type="date"-->
<!--          value-format="YYYY-MM-DD"-->
<!--          placeholder="削除日時を選んでください">-->
<!--        </el-date-picker>-->
<!--      </el-form-item>-->
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
        <el-button icon="Refresh" @click="resetQuery">リセット</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="primary"-->
<!--          plain-->
<!--          icon="Plus"-->
<!--          @click="handleAdd"-->
<!--          v-hasPermi="['dementia-api:patient:add']"-->
<!--        >新規作成</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="success"-->
<!--          plain-->
<!--          icon="Edit"-->
<!--          :disabled="single"-->
<!--          @click="handleUpdate"-->
<!--          v-hasPermi="['dementia-api:patient:edit']"-->
<!--        >変更</el-button>-->
<!--      </el-col>-->
      <el-col :span="1.5">
<!--        action  ファイルアップロード後のリクエストurl
            multiple  複数選択のファイルに対応しているか
            on-preview  ファイルリストのすでにアプロードされているファイルをクリックしたときのフック
            on-remove	ファイルリストからファイルを除去する際のフック
            before-remove	フェイルを削除する前のフック、パラメータはアプロードのフェイルとフェイルリストであり、falseを返した場合はプロミスを返してrejectされると削除を停止する。
            limit	許容アプロアド・ファイルの最大数
            on-exceed	制限を超えた場合、実行のフック関数
            show-file-list	すでにアプロードされているファイルを表示するかどうか
            accept	アップロードのファイルタイプ(https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept)（thumbnail-mode パラメータ）
            headers	エンドプレートのリクエストヘッドを設定する
            -->
        <el-upload
            v-model:file-list="fileList"
            class="upload-demo"
            action="/dementia-api/patient/upload" :headers="{'Content-Type': 'multipart/form-data'}"
            :limit="1"
            :show-file-list="false"
            :http-request="fileUpload"
            accept=".xlsx"
        >
          <el-button
              type="primary"
              plain
              icon="Plus"
              v-hasPermi="['dementia-api:patient:add']"
          >アップロード</el-button>
        </el-upload>
      </el-col>

<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--            type="success"-->
<!--            plain-->
<!--            icon="Finished"-->
<!--            @click="handlePatientDiagnosis"-->
<!--        >検査</el-button>-->
<!--      </el-col>-->
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['dementia-api:patient:remove']"
        >削除</el-button>
      </el-col>

<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="warning"-->
<!--          plain-->
<!--          icon="Download"-->
<!--          @click="handleExport"-->
<!--          v-hasPermi="['dementia-api:patient:export']"-->
<!--        >エクスポート</el-button>-->
<!--      </el-col>-->
      <right-toolbar v-model:showSearch="showSearch" :search="false" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="patientList" @selection-change="handleSelectionChange">
      <!---->
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="No." type="index" :index="indexMethod" />
      <el-table-column label="施設名" align="center" prop="deptName" sortable width="200"/>
      <el-table-column label="名前" align="center" prop="name" />
      <el-table-column label="医者" align="center" prop="doctorName" width="100" />
      <el-table-column label="年齢" align="center" prop="age" />
      <el-table-column label="誕生日" align="center" prop="birthday" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.birthday, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="診断日" align="center" prop="examday" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.examday, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性別" align="center" prop="sex">
        <template #default="scope">
          <dict-tag :options="sys_user_sex" :value="scope.row.sex"/>
        </template>
      </el-table-column>
      <el-table-column label="身長" align="center" prop="height" />
      <el-table-column label="体重" align="center" prop="weight" />
      <el-table-column label="BMI" align="center" prop="bmi" width="100">
        <template #default="scope">
          <span>{{ scope.row.bmi == null ? "":parseFloat(scope.row.bmi.toFixed(5)) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="拡張期血圧" align="center" prop="dp"  width="100"/>
      <el-table-column label="収縮期血圧" align="center" prop="sp"  width="100"/>
      <el-table-column label="赤血球数" align="center" prop="rbc" width="100"/>
      <el-table-column label="Ht" align="center" prop="ht" />
      <el-table-column label="Hb" align="center" prop="hb" />
      <el-table-column label="AST" align="center" prop="ast" />
      <el-table-column label="ALT" align="center" prop="alt" />
      <el-table-column label="R-GT" align="center" prop="rGt" />
      <el-table-column label="TG" align="center" prop="tg" />
      <el-table-column label="HDL-Cho" align="center" prop="hdlCho" width="100" />
      <el-table-column label="LDL-Cho" align="center" prop="ldlCho" />
      <el-table-column label="グルコース" align="center" prop="glu"  width="100"/>
      <el-table-column label="HbA1c" align="center" prop="hba1c" />
      <el-table-column label="クレアチニン" align="center" prop="cr"  width="120"/>
      <el-table-column label="尿酸" align="center" prop="ua" />
<!--      <el-table-column label="電話番号" align="center" prop="phone" />-->
      <el-table-column label="リスク群" align="center" prop="score" sortable width="100"/>
<!--      <el-table-column label="作成者" align="center" prop="createdUser" />-->
<!--      <el-table-column label="新規日時" align="center" prop="createdTime" width="180">-->
<!--        <template #default="scope">-->
<!--          <span>{{ parseTime(scope.row.createdTime, '{y}-{m}-{d}') }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      <el-table-column label="更新者" align="center" prop="updatedUser" />-->
<!--      <el-table-column label="更新日時" align="center" prop="updatedTime" width="180">-->
<!--        <template #default="scope">-->
<!--          <span>{{ parseTime(scope.row.updatedTime, '{y}-{m}-{d}') }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      <el-table-column label="削除者" align="center" prop="deletedUser" />-->
<!--      <el-table-column label="削除日時" align="center" prop="deletedTime" width="180">-->
<!--        <template #default="scope">-->
<!--          <span>{{ parseTime(scope.row.deletedTime, '{y}-{m}-{d}') }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="80">
        <template #default="scope">
<!--          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['dementia-api:patient:edit']">変更</el-button>-->
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['dementia-api:patient:remove']">削除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 追加また患者情報修正ダイアログ -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="patientRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="患者名" prop="name">
          <el-input v-model="form.name" placeholder="患者名を入力してください" />
        </el-form-item>
        <el-form-item label="年齢" prop="age">
          <el-input v-model="form.age" placeholder="年齢を入力してください" />
        </el-form-item>
        <el-form-item label="誕生日" prop="birthday">
          <el-date-picker clearable
            v-model="form.birthday"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="誕生日を選んでください">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="診断日" prop="examday">
          <el-date-picker clearable
            v-model="form.examday"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="診断日を選んでください">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="性別;0-男 1-女" prop="sex">
          <el-select v-model="form.sex" placeholder="性別;0-男 1-女を選んでください">
            <el-option
              v-for="dict in sys_user_sex"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="身長" prop="height">
          <el-input v-model="form.height" placeholder="身長を入力してください" />
        </el-form-item>
        <el-form-item label="体重" prop="weight">
          <el-input v-model="form.weight" placeholder="体重を入力してください" />
        </el-form-item>
        <el-form-item label="BMI" prop="bmi">
          <el-input v-model="form.bmi" placeholder="BMIを入力してください" />
        </el-form-item>
        <el-form-item label="拡張期血圧" prop="dp">
          <el-input v-model="form.dp" placeholder="拡張期血圧を入力してください" />
        </el-form-item>
        <el-form-item label="収縮期血圧" prop="sp">
          <el-input v-model="form.sp" placeholder="収縮期血圧を入力してください" />
        </el-form-item>
        <el-form-item label="赤血球数" prop="rbc">
          <el-input v-model="form.rbc" placeholder="赤血球数を入力してください" />
        </el-form-item>
        <el-form-item label="ヘマトクリット" prop="ht">
          <el-input v-model="form.ht" placeholder="ヘマトクリットを入力してください" />
        </el-form-item>
        <el-form-item label="ヘモグロビン" prop="hb">
          <el-input v-model="form.hb" placeholder="ヘモグロビンを入力してください" />
        </el-form-item>
        <el-form-item label="アスパラギン酸アミノトランスフェラーゼ" prop="ast">
          <el-input v-model="form.ast" placeholder="アスパラギン酸アミノトランスフェラーゼを入力してください" />
        </el-form-item>
        <el-form-item label="アラニンアミノトランスフェラーゼ" prop="alt">
          <el-input v-model="form.alt" placeholder="アラニンアミノトランスフェラーゼを入力してください" />
        </el-form-item>
        <el-form-item label="R-GT" prop="rGt">
          <el-input v-model="form.rGt" placeholder="R-GTを入力してください" />
        </el-form-item>
        <el-form-item label="トリグリセリド" prop="tg">
          <el-input v-model="form.tg" placeholder="トリグリセリドを入力してください" />
        </el-form-item>
        <el-form-item label="HDLコレステロール" prop="hdlCho">
          <el-input v-model="form.hdlCho" placeholder="HDLコレステロールを入力してください" />
        </el-form-item>
        <el-form-item label="LDLコレステロール" prop="ldlCho">
          <el-input v-model="form.ldlCho" placeholder="LDLコレステロールを入力してください" />
        </el-form-item>
        <el-form-item label="グルコース" prop="glu">
          <el-input v-model="form.glu" placeholder="グルコースを入力してください" />
        </el-form-item>
        <el-form-item label="HbA1c" prop="hba1c">
          <el-input v-model="form.hba1c" placeholder="HbA1cを入力してください" />
        </el-form-item>
        <el-form-item label="クレアチニン" prop="cr">
          <el-input v-model="form.cr" placeholder="クレアチニンを入力してください" />
        </el-form-item>
        <el-form-item label="尿酸" prop="ua">
          <el-input v-model="form.ua" placeholder="尿酸を入力してください" />
        </el-form-item>
        <el-form-item label="電話番号" prop="phone">
          <el-input v-model="form.phone" placeholder="電話番号を入力してください" />
        </el-form-item>
        <el-form-item label="Score;&gt;=27 A 24-26 B &lt;24 C" prop="score">
          <el-input v-model="form.score" placeholder="Scoreを入力してください;&gt;=27 A 24-26 B &lt;24 C" />
        </el-form-item>
        <el-form-item label="作成者" prop="createdUser">
          <el-input v-model="form.createdUser" placeholder="作成者を入力してください" />
        </el-form-item>
        <el-form-item label="作成日時" prop="createdTime">
          <el-date-picker clearable
            v-model="form.createdTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="新規日時を選んでください">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="更新者" prop="updatedUser">
          <el-input v-model="form.updatedUser" placeholder="更新者を入力してください" />
        </el-form-item>
        <el-form-item label="更新日時" prop="updatedTime">
          <el-date-picker clearable
            v-model="form.updatedTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="更新日時を選んでください">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="削除者" prop="deletedUser">
          <el-input v-model="form.deletedUser" placeholder="削除者を入力してください" />
        </el-form-item>
        <el-form-item label="削除日時" prop="deletedTime">
          <el-date-picker clearable
            v-model="form.deletedTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="削除日時を選んでください">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">確 定</el-button>
          <el-button @click="cancel">キャンセル</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Patient">
import {
  listPatient,
  getPatient,
  delPatient,
  addPatient,
  updatePatient,
  uploadFile,
  patientDiagnosis, patientDiagnosisById
} from "@/api/dementia-api/patient";
import useUserStore from "@/store/modules/user.js";

const { proxy } = getCurrentInstance();
const { sys_user_sex } = proxy.useDict('sys_user_sex');

const isAdmin = ref(useUserStore().roles == "admin")

const patientList = ref([]);
const open = ref(false);
const loading = ref(true);
const pageLoading = ref(false);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const fileList = ref([
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    age: null,
    birthday: null,
    examday: null,
    sex: null,
    height: null,
    weight: null,
    bmi: null,
    dp: null,
    sp: null,
    rbc: null,
    ht: null,
    hb: null,
    ast: null,
    alt: null,
    rGt: null,
    tg: null,
    hdlCho: null,
    ldlCho: null,
    glu: null,
    hba1c: null,
    cr: null,
    ua: null,
    phone: null,
    score: null,
    createdUser: null,
    createdTime: null,
    updatedUser: null,
    updatedTime: null,
    deletedUser: null,
    deletedTime: null,
    deptName: null,
    doctorName: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 患者情報リスト */
function getList() {
  loading.value = true;
  if(!isAdmin.value){
    queryParams.value.createdUser = useUserStore().id
  }
  listPatient(queryParams.value).then(response => {
    patientList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消ボタン
function cancel() {
  open.value = false;
  reset();
}

// Formリセット
function reset() {
  form.value = {
    id: null,
    name: null,
    age: null,
    birthday: null,
    examday: null,
    sex: null,
    height: null,
    weight: null,
    bmi: null,
    dp: null,
    sp: null,
    rbc: null,
    ht: null,
    hb: null,
    ast: null,
    alt: null,
    rGt: null,
    tg: null,
    hdlCho: null,
    ldlCho: null,
    glu: null,
    hba1c: null,
    cr: null,
    ua: null,
    phone: null,
    score: null,
    createdUser: null,
    createdTime: null,
    updatedUser: null,
    updatedTime: null,
    deletedUser: null,
    deletedTime: null
  };
  proxy.resetForm("patientRef");
}

/** 検索ボタン操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** リセットボタン操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 複数選択ボックス選択データ
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新規ボタン操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "患者情報追加";
}

/** 修正ボタン操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getPatient(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "患者情報修正";
  });
}

/** commitボタン */
function submitForm() {
  proxy.$refs["patientRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePatient(form.value).then(response => {
          proxy.$modal.msgSuccess("変更に成功しました。");
          open.value = false;
          getList();
        });
      } else {
        addPatient(form.value).then(response => {
          proxy.$modal.msgSuccess("新規追加に成功しました");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 削除ボタン操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  var confirmData = "次のデータ項目を削除するか確認してください。\n";
  if(row.id){
    confirmData += isAdmin ? row.deptName + "\t" + row.name + "\t" + row.birthday + "\t" + row.examday + "\n" : row.name + "\t" + row.birthday + "\t" + row.examday + "\n"
  }else{
    for (let i = 0; i <ids.value.length; i++) {
      confirmData += isAdmin ? patientList.value[i].deptName + "\t" + patientList.value[i].name + "\t" + (patientList.value[i].birthday ? patientList.value[i].birthday : "                  ") + "\t" + patientList.value[i].examday + "\n" : patientList.value[i].name + "\t" + (patientList.value[i].birthday ? patientList.value[i].birthday : "                  ") + "\t" + patientList.value[i].examday + "\n"
    }
  }
  proxy.$modal.confirm(confirmData).then(function() {
    return delPatient(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除に成功しました");
  }).catch(() => {});
}

/** エクスポートボタン操作 */
function handleExport() {
  proxy.download('dementia-api/patient/export', {
    ...queryParams.value
  }, `patient_${new Date().getTime()}.xlsx`)
}

function fileUpload(option){
  uploadFile(option).then(function (res){
    if(res.code === 200){
      proxy.$modal.msgSuccess("インポート成功しました");
    }
    fileList.value = []
    getList();
  }).catch(function (res){
    fileList.value = []
  })
}
function indexMethod(index){
  return index + 1
}

// function handlePatientDiagnosis(){
//   pageLoading.value = true
//   if(ids.value.length){
//     patientDiagnosisById(ids.value).then(function (res){
//       if(res.code === 200){
//         pageLoading.value = false
//         proxy.$modal.msgSuccess("患者の検査が完了しました");
//         getList();
//       }else{
//         pageLoading.value = false
//         proxy.$modal.msgWarning("検査サーバーがビジー状態です。後でもう一度お試しください。");
//       }
//     })
//   }else{
//     patientDiagnosis().then(function (res){
//       if(res.code === 200){
//         pageLoading.value = false
//         proxy.$modal.msgSuccess("患者の検査が完了しました");
//         getList();
//       }else{
//         pageLoading.value = false
//         proxy.$modal.msgWarning("検査サーバーがビジー状態です。後でもう一度お試しください。");
//       }
//     })
//   }
// }


getList();
</script>
